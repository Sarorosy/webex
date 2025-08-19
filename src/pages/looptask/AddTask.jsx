import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronsRight, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { Editor } from "@tinymce/tinymce-react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import dayjs from "dayjs";
import { useAuth } from "../../utils/idb";
import { motion } from "framer-motion";
import { useSelectedUser } from "../../utils/SelectedUserContext";

export default function AddTask({ onClose }) {
  const [buckets, setBuckets] = useState([]);
  const [milestonesList, setMilestonesList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const { selectedMessageFortask, setSelectedMessageFortask } =
    useSelectedUser();
  const { selectedUser, setSelectedUser } = useSelectedUser();

  const editorRef = useRef(null);

  const todayDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const tempTitle =
    selectedUser?.type == "group"
      ? `Task from CCP - ${selectedUser?.name}`
      : `Task from CCP`;
  const tempUserId = selectedUser?.email
    ? users.find((user) => user.fld_email == selectedUser.email)?.id
    : null;
  const loggedInUser = user?.email
    ? users.find((u) => u.fld_email === user.email)
    : null;

  console.log("loggedInUser", loggedInUser);

  const [formData, setFormData] = useState({
    bucketId: "",
    assignedTo: [tempUserId],
    projectId: "",
    dueTime: "",
    dueDate: "",
    recurring: "No",
    recurringDuration: "",
    recurringType: "",
    followers: [],
    title: tempTitle,
    description: selectedMessageFortask?.message || "",
    googleLink: "",
    additionalLink: "",
  });

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    if (tempUserId) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: [tempUserId],
      }));
    }
  }, [tempUserId, users]);

  const dateRef = useRef();
  useEffect(() => {
    flatpickr(dateRef.current, {
      dateFormat: "d/m/Y",
      defaultDate: formData.dueDate ? dayjs(formData.dueDate).toDate() : null,
      onChange: (selectedDates) => {
        const formatted = dayjs(selectedDates[0]).format("YYYY-MM-DD");
        setFormData((prev) => ({
          ...prev,
          dueDate: formatted,
        }));
      },
    });
  }, []);

  const [milestones, setMilestones] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [bucketsRes, milestonesRes, projectsRes, usersRes] =
        await Promise.all([
          fetch("https://loopback-skci.onrender.com/api/helper/allbuckets"),
          fetch("https://loopback-skci.onrender.com/api/helper/allbenchmarks"),
          fetch("https://loopback-skci.onrender.com/api/helper/allprojects"),
          fetch("https://loopback-skci.onrender.com/api/users/allusers"),
        ]);
      setBuckets((await bucketsRes.json())?.data || []);
      setMilestonesList((await milestonesRes.json())?.data || []);
      setProjects((await projectsRes.json())?.data || []);
      setUsers((await usersRes.json())?.data || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { milestoneId: "", milestoneDueDate: todayDateTime },
    ]);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const addFile = () => {
    if (files.length < 3) setFiles([...files, { file: null, fileName: "" }]);
    else toast.error("Max 3 files allowed");
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, field, value) => {
    const updated = [...files];
    updated[index][field] = value;
    setFiles(updated);
  };

  const [creatingTask, setCreatingTask] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation function
    const validateForm = () => {
      const errors = [];

      // Required field validations
      if (!formData.title.trim()) {
        errors.push("Task title is required");
      }

      if (!formData.bucketId) {
        errors.push("Please select a bucket");
      }

      if (!formData.projectId) {
        //errors.push("Please select a project");
      }

      if (formData.assignedTo.length === 0) {
        errors.push("Please assign the task to at least one user");
      }

      if (!formData.dueDate) {
        //errors.push("Due date is required");
      }

      // Validate due date is not in the past
      if (formData.dueDate) {
        const today = new Date().toISOString().split("T")[0];
        if (formData.dueDate < today) {
          errors.push("Due date cannot be in the past");
        }
      }

      // Validate recurring task fields
      if (formData.recurring === "Yes") {
        if (!formData.recurringDuration) {
          errors.push("Please select recurring frequency");
        }
        if (!formData.recurringType) {
          errors.push("Please select recurring type");
        }
      }

      // Validate URL formats
      const urlPattern = /^https?:\/\/.+/;
      if (formData.googleLink && !urlPattern.test(formData.googleLink)) {
        errors.push(
          "Google link must be a valid URL starting with http:// or https://"
        );
      }

      if (
        formData.additionalLink &&
        !urlPattern.test(formData.additionalLink)
      ) {
        errors.push(
          "Additional link must be a valid URL starting with http:// or https://"
        );
      }

      // Validate milestones
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        if (!milestone.milestoneId) {
          errors.push(`Milestone ${i + 1}: Please select a milestone`);
        }
        if (!milestone.milestoneDueDate) {
          errors.push(`Milestone ${i + 1}: Due date is required`);
        }
      }

      // Validate files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.file) {
          errors.push(`File ${i + 1}: Please select a file`);
        }
        if (!file.fileName.trim()) {
          errors.push(`File ${i + 1}: File name is required`);
        }

        // File size validation (10MB limit)
        if (file.file && file.file.size > 10 * 1024 * 1024) {
          errors.push(`File ${i + 1}: File size must be less than 10MB`);
        }

        // File type validation (optional - add allowed types as needed)
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "text/csv",
        ];

        if (file.file && !allowedTypes.includes(file.file.type)) {
          errors.push(
            `File ${
              i + 1
            }: Unsupported file type. Please use images, PDFs, Word docs, Excel files, or text files.`
          );
        }
      }

      return errors;
    };

    // Run validation
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      // Display all validation errors
      validationErrors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    try {
      setCreatingTask(true);
      // Show loading state
      const loadingToast = toast.loading("Creating task...");

      // Create FormData object
      const formDataToSend = new FormData();

      const fallbackUser = {
        id: 1,
        fld_admin_type: "TEAM MEMBER",
        fld_first_name: "Puneet",
        fld_last_name: "",
      };

      const effectiveUser = loggedInUser || fallbackUser;

      // Then:
      formDataToSend.append("user_id", effectiveUser.id);
      formDataToSend.append("user_type", effectiveUser.fld_admin_type);
      formDataToSend.append(
        "user_name",
        `${effectiveUser.fld_first_name} ${effectiveUser.fld_last_name}`.trim()
      );

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("bucket_name", formData.bucketId);
      formDataToSend.append("project_name", formData.projectId);
      formDataToSend.append("due_date", formData.dueDate);
      formDataToSend.append("due_time", formData.dueTime || "");
      formDataToSend.append("recurring", formData.recurring);
      formDataToSend.append(
        "google_sheets_or_docs_link",
        formData.googleLink || ""
      );
      formDataToSend.append("fld_asana_link", formData.additionalLink || "");

      // Append recurring fields if applicable
      if (formData.recurring === "Yes") {
        formDataToSend.append("recurring_duration", formData.recurringDuration);
        formDataToSend.append("recurring_type", formData.recurringType);
      } else {
        formDataToSend.append("recurring_tasks", formData.recurring ?? "No");
      }

      // Append arrays as JSON strings
      formDataToSend.append("assigned_to", JSON.stringify(formData.assignedTo));
      formDataToSend.append("follower", formData.followers.join(","));

      // Append milestones
      if (milestones.length > 0) {
        formDataToSend.append("benchmark_name", JSON.stringify(milestones));
      }

      // Append files
      files.forEach((fileObj, index) => {
        if (fileObj.file) {
          formDataToSend.append(`file_upload[]`, fileObj.file);
          formDataToSend.append(`file_names[]`, fileObj.fileName);
        }
      });

      // Make API call
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/tasks/create",
        {
          method: "POST",
          body: formDataToSend,
          // Don't set Content-Type header - let browser set it with boundary for FormData
        }
      );

      const result = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success("Task created successfully!");
        onClose();

        // Reset form after successful submission
        // setFormData({
        //   bucketId: "",
        //   assignedTo: [],
        //   projectId: "",
        //   dueTime: "",
        //   dueDate: "",
        //   recurring: "No",
        //   recurringDuration: "",
        //   recurringType: "",
        //   followers: [],
        //   title: "",
        //   description: "",
        //   googleLink: "",
        //   additionalLink: "",
        // });
        // setMilestones([]);
        // setFiles([]);

        // Optional: Redirect to task list or task detail page
        // window.location.href = '/tasks';
        // or if using React Router:
        // navigate('/tasks');
      } else {
        // Handle API errors
        const errorMessage = result.message || "Failed to create task";
        toast.error(errorMessage);

        // Log detailed error for debugging
        console.error("Task creation failed:", result);
      }
    } catch (error) {
      toast.dismiss(); // Dismiss any loading toasts

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Task creation error:", error);
    } finally {
      setCreatingTask(false);
    }
  };

  const selectOptions = (
    list,
    labelKey = "fld_first_name",
    valueKey = "id",
    extra = ""
  ) =>
    list.map((item) => ({
      value: item[valueKey],
      label: `${item[labelKey]} ${extra && item[extra]}`,
    }));

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      padding: "0.125rem",
      fontSize: "0.875rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "0.875rem",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      fontSize: "0.875rem",
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 w-full max-w-4xl relative ${
          theme == "dark"
            ? "bg-gray-800 text-white mw-dark"
            : "bg-white text-black"
        } shadow-xl z-[100] flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-4 py-2 border-b font-semibold text-lg flex justify-between items-center sticky top-0
            ${
              theme == "dark"
                ? "bg-gray-500 text-white mw-dark"
                : "bg-gray-300 text-black"
            }
          `}
        >
          <span>Create New Task</span>
          <button
            onClick={onClose}
            className="text-sm text-white bg-orange-600 px-1 py-1 rounded  hover:bg-orange-800"
          >
            <X size={13} />
          </button>
        </div>
        <div className="w-full f-13 px-4 py-6 pr-1 flex flex-col flex-1 overflow-y-auto">
          <div className="overflow-y-auto flex-1 flex flex-col pr-4">
            <form className=" ">
              <div>
                {/* Basic Information */}
                <div
                  className={`mb-4 p-3 border border-gray-200 ${
                    theme == "dark"
                      ? "bg-gray-700 text-gray-100 mw-dark"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <h2 className="text-[14px] font-medium text-orange-600 mb-4 flex items-end leading-none ">
                    <div className="w-1 h-4 bg-orange-600 rounded-full mr-2"></div>
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Bucket
                      </label>
                      <Select
                        classNamePrefix={`${
                          theme == "dark"
                            ? "!bg-gray-800 !border-gray-400 !text-white !placeholder-gray-100 dark-select"
                            : ""
                        } task-filter`}
                        styles={customSelectStyles}
                        options={selectOptions(buckets, "fld_bucket_name")}
                        value={
                          selectOptions(buckets, "fld_bucket_name").find(
                            (o) => o.value === formData.bucketId
                          ) || null
                        }
                        onChange={(option) => {
                          const selectedBucket = buckets.find(
                            (b) => b.id === option?.value
                          );
                          const benchmarkIds =
                            selectedBucket?.fld_default_benchmark
                              ? selectedBucket.fld_default_benchmark
                                  .split(",")
                                  .map((id) => parseInt(id)) // Make sure IDs are numbers
                              : [];

                          const newMilestones = benchmarkIds.map((id) => ({
                            milestoneId: id,
                            milestoneDueDate: todayDateTime,
                          }));

                          setFormData((prev) => ({
                            ...prev,
                            bucketId: option?.value || "",
                            description:
                              selectedBucket?.fld_default_description ||
                              prev.description,
                          }));

                          if (milestonesList.length > 0) {
                            setMilestones(newMilestones);
                          }
                        }}
                        placeholder="Select Bucket"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Assign To
                      </label>
                      <Select
                        classNamePrefix={`${
                          theme == "dark"
                            ? "!bg-gray-800 !border-gray-400 !text-white !placeholder-gray-100 dark-select"
                            : ""
                        } task-filter`}
                        styles={customSelectStyles}
                        options={selectOptions(
                          users,
                          "fld_first_name",
                          "id",
                          "fld_last_name"
                        )}
                        value={selectOptions(
                          users,
                          "fld_first_name",
                          "id",
                          "fld_last_name"
                        ).filter((o) => formData.assignedTo.includes(o.value))}
                        onChange={(selectedOption) =>
                          setFormData({
                            ...formData,
                            assignedTo: selectedOption
                              ? [selectedOption.value]
                              : [],
                          })
                        }
                        placeholder="Select User"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Project
                      </label>
                      <Select
                        classNamePrefix={`${
                          theme == "dark"
                            ? "!bg-gray-800 !border-gray-400 !text-white !placeholder-gray-100 dark-select"
                            : ""
                        } task-filter`}
                        styles={customSelectStyles}
                        options={selectOptions(projects, "fld_project_name")}
                        value={
                          selectOptions(projects, "fld_project_name").find(
                            (o) => o.value === formData.projectId
                          ) || null
                        }
                        onChange={(option) =>
                          setFormData({
                            ...formData,
                            projectId: option?.value || "",
                          })
                        }
                        placeholder="Select Project"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Followers
                      </label>
                      <Select
                        classNamePrefix={`${
                          theme == "dark"
                            ? "!bg-gray-800 !border-gray-400 !text-white !placeholder-gray-100 dark-select"
                            : ""
                        } task-filter`}
                        styles={customSelectStyles}
                        isMulti
                        options={selectOptions(
                          users.filter((u) => u.id !== user?.id), // exclude current user
                          "fld_first_name"
                        )}
                        value={selectOptions(
                          users.filter((u) => u.id !== user?.id),
                          "fld_first_name"
                        ).filter((u) => formData.followers.includes(u.value))}
                        onChange={(selected) =>
                          setFormData({
                            ...formData,
                            followers: selected.map((s) => s.value),
                          })
                        }
                        placeholder="Select Followers"
                      />
                    </div>
                  </div>
                </div>

                {/* Task Details */}
                <div
                  className={`mb-4 p-3 border border-gray-200 ${
                    theme == "dark"
                      ? "bg-gray-700 text-gray-100 mw-dark"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <h2 className="text-[14px] font-medium text-orange-600 mb-4 flex items-end leading-none ">
                    <div className="w-1 h-4 bg-orange-600 rounded-full mr-2"></div>
                    Task Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Task Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        placeholder="Enter task title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Description
                      </label>
                      {/* <textarea
                      name="description"
                      placeholder="Enter task description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    /> */}

                      <Editor
                        apiKey="2crkajrj0p3qpzebc7qfndt5c6xoy8vwer3qt5hsqqyv8hb8"
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        value={formData.description}
                        onEditorChange={(newContent) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: newContent,
                          }))
                        }
                        className={`!bg-gray-700`}
                        init={{
                          height: 250,
                          menubar: true,
                          plugins: [
                            "advlist autolink lists link image charmap print preview anchor",
                            "searchreplace visualblocks code fullscreen",
                            "insertdatetime media table paste code help wordcount",
                          ],
                          toolbar:
                            "undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`mb-4 bg-3 border border-gray-200 p-3 ${
                    theme == "dark"
                      ? "bg-gray-700 text-white mw-dark"
                      : "bg-gray-50 text-black"
                  }`}
                >
                  {/* Timing & Schedule */}
                  <h2 className="text-[14px] font-medium text-orange-600 mb-4 flex items-end leading-none ">
                    <div className="w-1 h-4 bg-orange-600 rounded-full mr-2"></div>
                    Timing & Schedule
                  </h2>
                  <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium mb-1">
                          Due Date
                        </label>
                        <input
                          type="text"
                          name="dueDate"
                          ref={dateRef}
                          value={
                            formData.dueDate
                              ? dayjs(formData.dueDate).format("DD/MM/YYYY")
                              : ""
                          }
                          readOnly
                          className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                        />
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium mb-1">
                          Due Time
                        </label>
                        <input
                          type="time"
                          name="dueTime"
                          value={formData.dueTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dueTime: e.target.value,
                            })
                          }
                          className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-7">
                    {formData.recurring === "Yes" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full ">
                        <div>
                          <label className="block text-[13px] font-medium mb-1">
                            Frequency
                          </label>
                          <select
                            name="recurring_duration"
                            className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                            required
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                recurringDuration: e.target.value,
                              })
                            }
                            value={formData.recurringDuration || ""}
                          >
                            <option value="">Select Frequency</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[13px] font-medium mb-1">
                            Recurring Type
                          </label>
                          <select
                            name="recurring_type"
                            className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                            required
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                recurringType: e.target.value,
                              })
                            }
                            value={formData.recurringType || ""}
                          >
                            <option value="">Select Type</option>
                            <option value="Non Stop">Non Stop</option>
                            <option value="Stop after 3 times repetition">
                              Stop after 3 times repetition
                            </option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div
                  className={`mb-4 bg-3 border border-gray-200 p-3 ${
                    theme == "dark"
                      ? "bg-gray-700 text-white mw-dark"
                      : "bg-gray-50 text-black"
                  }`}
                >
                  <h2 className="text-[14px] font-medium text-orange-600 mb-4 flex items-end leading-none ">
                    <div className="w-1 h-4 bg-orange-600 rounded-full mr-2"></div>
                    Links & References
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Google Sheets/Docs Link
                      </label>
                      <input
                        type="url"
                        name="googleLink"
                        placeholder="https://docs.google.com/..."
                        value={formData.googleLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            googleLink: e.target.value,
                          })
                        }
                        className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium mb-1">
                        Additional Link
                      </label>
                      <input
                        type="url"
                        name="additionalLink"
                        placeholder="https://example.com/..."
                        value={formData.additionalLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalLink: e.target.value,
                          })
                        }
                        className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div
                className={`mb-4 bg-3 border border-gray-200 p-3 ${
                  theme == "dark"
                    ? "bg-gray-700 text-white mw-dark"
                    : "bg-gray-50 text-black"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[14px] font-medium text-orange-600 flex items-center">
                    <div className="w-1 h-4 bg-orange-600 rounded-full mr-2"></div>
                    Milestones
                  </h2>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[10px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
                  >
                    + Add Milestone
                  </button>
                </div>
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className={`${
                        theme == "dark"
                          ? "bg-gray-600 text-white mw-dark"
                          : "bg-gray-50 text-black"
                      } rounded p-2 border border-gray-200 flex items-end gap-3`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                          <label className="block text-[13px] font-medium mb-1">
                            Milestone
                          </label>
                          <Select
                            classNamePrefix={`${
                              theme == "dark"
                                ? "!bg-gray-800 !border-gray-400 !text-white !placeholder-gray-100 dark-select"
                                : ""
                            } task-filter`}
                            styles={customSelectStyles}
                            options={selectOptions(
                              milestonesList,
                              "fld_benchmark_name"
                            )}
                            value={
                              selectOptions(
                                milestonesList,
                                "fld_benchmark_name"
                              ).find((o) => o.value == m.milestoneId) || null
                            }
                            onChange={(option) =>
                              handleMilestoneChange(
                                i,
                                "milestoneId",
                                option?.value
                              )
                            }
                            placeholder="Select Milestone"
                          />
                        </div>
                        {/* <div>
                        <label className="block text-[13px] font-medium mb-1">
                          Due Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={m.milestoneDueDate}
                          onChange={(e) =>
                            handleMilestoneChange(
                              i,
                              "milestoneDueDate",
                              e.target.value
                            )
                          }
                           className={`
                          ${
                            theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-100" : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                        />
                      </div> */}
                        <div className="mt-3 flex justify-end items-end">
                          <button
                            type="button"
                            onClick={() => removeMilestone(i)}
                            className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <div className="text-center py-2 text-red-700 bg-red-50">
                      <p className="text-[12px]">No milestones added yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Files */}
              <div
                className={`mb-4 bg-3 border border-gray-200 p-3 ${
                  theme == "dark"
                    ? "bg-gray-700 text-white mw-dark"
                    : "bg-gray-50 text-black"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[14px] font-medium text-orange-600 flex items-center">
                    <div className="w-1 h-4 bg-orange-600 rounded-full mr-2"></div>
                    Attachments
                    <span className="ml-2 text-[13px] text-gray-500 font-normal">
                      (Max 3 files)
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={addFile}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[10px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
                  >
                    + Add File
                  </button>
                </div>
                <div className="gap-3">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className={`${
                        theme == "dark"
                          ? "bg-gray-600 text-white mw-dark"
                          : "bg-gray-50 text-black"
                      } rounded p-2 border border-gray-200 flex items-end gap-3`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  w-full">
                        <div>
                          <label className="block text-[13px] font-medium mb-1">
                            Select File
                          </label>
                          {/* <input
                          type="file"
                          onChange={(e) =>
                            handleFileChange(i, "file", e.target.files[0])
                          }
                           className={`
                          ${
                            theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-100" : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                        /> */}
                          <div
                            className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          } flex items-center w-full border border-gray-300 rounded  text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                          >
                            <label className="relative cursor-pointer bg-gray-500 text-white px-2 py-1.5 rounded hover:bg-blue-600 whitespace-nowrap">
                              Choose File
                              <input
                                type="file"
                                onChange={(e) =>
                                  handleFileChange(i, "file", e.target.files[0])
                                }
                                className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </label>
                            <span className="ml-3 text-gray-600  truncate w-100">
                              {files[i]?.file?.name || "No file chosen"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium mb-1">
                            File Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter file name"
                            value={f.fileName}
                            onChange={(e) =>
                              handleFileChange(i, "fileName", e.target.value)
                            }
                            className={`
                          ${
                            theme == "dark"
                              ? "bg-gray-800 border-gray-400 text-gray-100"
                              : ""
                          }
                          w-full border border-gray-300 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors
                        `}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="bg-red-600 hover:bg-red-700 p-2 rounded text-white mt-2"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {files.length === 0 && (
                    <div className="text-center py-2 text-red-700 bg-red-50">
                      <p className="text-[12px]">No files attached yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-2 py-1.5 border border-transparent text-[12px] leading-none font-medium rounded shadow-sm text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500 transition-colors"
                >
                  {creatingTask ? "Creating..." : "Create Task"}{" "}
                  <ChevronsRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
