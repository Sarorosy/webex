import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pen, X } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../../utils/idb";
import AddMembers from "./AddMembers";
import InviteMembers from "./InviteMembers";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import EditGroup from "./EditGroup";

const GroupInfo = ({ selectedGroup, onClose }) => {
  console.log(selectedGroup);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const { user, theme } = useAuth();

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [editGroupOpen, setEditGroupOpen] = useState(false);

  const handleAddMemberClick = (groupId) => {
    setSelectedGroupId(groupId);
    setAddMemberOpen(true);
  };

  const handleInviteMemberClick = (groupId) => {
    setSelectedGroupId(groupId);
    setInviteMemberOpen(true);
  };
  const fetchGroupData = async () => {
    try {
      const groupRes = await fetch(
        `https://webexback-06cc.onrender.com/api/groups/group/${selectedGroup.id}`
      );
      const groupData = await groupRes.json();
      if (groupData.status) setGroup(groupData.group);
      setLoadingGroup(false);

      const membersRes = await fetch(
        `https://webexback-06cc.onrender.com/api/groups/members/${selectedGroup.id}`
      );
      const membersData = await membersRes.json();
      if (membersData.status) setMembers(membersData.members);
      setLoadingMembers(false);
    } catch (err) {
      console.error("Error fetching group data:", err);
      setLoadingGroup(false);
      setLoadingMembers(false);
    }
  };
  useEffect(() => {
    fetchGroupData();
  }, [selectedGroup]);

  const [deleteMemberOpen, setDeleteMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const confirmDeleteMember = async () => {
    try {
      const response = await fetch(
        "https://webexback-06cc.onrender.com/api/groups/remove-member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            delete_user_name: selectedMember?.name,
            post_user_id: user?.id,
            user_id: selectedMember?.id,
            user_name: user?.name,
            own: false,
            group_id: selectedGroup?.id,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        setDeleteMemberOpen(false);
        setSelectedMember(null);
        toast.success("Done");
      } else {
        toast.error(data.message || "Error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      fetchGroupData();
    }
  };

  const handleSendRequest = async () => {
    try {
      const response = await fetch(
        "https://webexback-06cc.onrender.com/api/grouplimit/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_id: selectedGroup.id,
            sender_id: user.id,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success(data.message || "Request Sent Succesfully");
        onClose();
      } else {
        toast.error(data.message || "Failed to send request");
      }
    } catch {
      console.error("Error sending request");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[99] flex items-end justify-center">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "5%" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className={`${
          theme == "dark" ? "bg-gray-500 text-gray-50" : "bg-white"
        } rounded-t-3xl w-full max-w-2xl h-[90%] shadow-xl relative`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
        >
          <X size={18} />
        </button>

        {/* Banner */}
        <div
          className={`w-full h-[100px]  rounded-t-3xl ${
            theme == "dark" ? "bg-gray-800" : "bg-orange-300"
          } `}
        />

        {/* Group Info Card */}
        <div className="px-6 -mt-12">
          <div
            className={`${
              theme == "dark" ? "bg-gray-400 text-gray-50" : "bg-white"
            } rounded-xl shadow-md p-5`}
          >
            <h2
              className={`text-lg font-bold ${
                theme == "dark" ? "text-black" : "text-gray-800"
              } flex items-center gap-2`}
            >
              {selectedGroup?.name}
              <button
                onClick={() => setEditGroupOpen(true)}
                className="border p-1 rounded-full "
              >
                <Pen size={13} />
              </button>
            </h2>
            {loadingGroup ? (
              <>
                <Skeleton height={28} width={160} className="mb-2" />
                <Skeleton count={2} />
              </>
            ) : (
              <>
                <p
                  className={`${
                    theme == "dark" ? "text-black" : "text-gray-600"
                  }  mt-1 mb-3`}
                >
                  {group.description}
                </p>
                <div
                  className={`flex flex-wrap gap-6 text-sm items-center ${
                    theme == "dark" ? "text-black" : "text-gray-600"
                  }`}
                >
                  <div>
                    <span className="font-medium ">Created by:</span>{" "}
                    {group.created_by_username}
                  </div>
                  <div>
                    <span className="font-medium ">Member Limit:</span>{" "}
                    {group.member_limit}
                  </div>
                  {!loadingMembers &&
                    (group.member_limit == members.length ? (
                      <div className="flex items-center">
                        <span className="font-medium text-red-500 bg-red-100 px-1 py-1 rounded">
                          Member Limit Full
                        </span>{" "}
                        <span className="ml-2">
                          <button
                            className="bg-orange-500 text-white px-2 py-1 rounded"
                            onClick={handleSendRequest}
                          >
                            Send Request
                          </button>{" "}
                          to Increase Limit ?
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            handleAddMemberClick(selectedGroup?.id);
                          }}
                          className="bg-orange-500 text-white px-2 py-1 f-11 hover:bg-orange-600 rounded"
                        >
                          Add Member(s)
                        </button>

                        <button
                          onClick={() => {
                            handleInviteMemberClick(selectedGroup?.id);
                          }}
                          className="bg-orange-500 text-white px-2 py-1 f-11 hover:bg-orange-600 rounded"
                        >
                          Invite Member(s)
                        </button>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="px-6 mt-6 overflow-y-auto h-[60%]">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Members ({loadingMembers ? "loading..." : members.length})
          </h3>

          {loadingMembers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl shadow-sm"
                >
                  <Skeleton circle height={42} width={42} />
                  <div className="flex-1">
                    <Skeleton width="80%" height={14} />
                    <Skeleton width="60%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map((member) => (
                <li
                  key={member.id}
                  className={`flex items-start justify-between gap-4 p-3 ${
                    theme == "dark" ? "bg-gray-200" : "bg-white"
                  } rounded shadow hover:shadow-md transition`}
                >
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {member.profile_pic ? (
                        <img
                          src={
                            member.profile_pic.startsWith("http")
                              ? member.profile_pic
                              : `https://rapidcollaborate.in/ccp${member.profile_pic}`
                          }
                          alt={member.name}
                          className="w-10 h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        member.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="f-11 text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  {member.id !== user?.id && (
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setDeleteMemberOpen(true);
                      }}
                      className="text-gray-400 hover:text-red-500"
                      title="Remove member"
                    >
                      <X size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No members found.</p>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {addMemberOpen && (
          <AddMembers
            groupId={selectedGroupId}
            onClose={() => {
              setAddMemberOpen(false);
            }}
            onSelect={(ids) => console.log(ids)}
            members={members}
            finalFunction={fetchGroupData}
          />
        )}

        {inviteMemberOpen && (
          <InviteMembers
            groupId={selectedGroupId}
            onClose={() => {
              setInviteMemberOpen(false);
            }}
            onSelect={(ids) => console.log(ids)}
            members={members}
          />
        )}
        {deleteMemberOpen && (
          <ConfirmationModal
            title="Are you sure want to remove this member?"
            message="This action cannot be undone."
            onYes={confirmDeleteMember}
            onClose={() => setDeleteMemberOpen(false)}
          />
        )}
        {editGroupOpen && (
          <EditGroup
            selectedGroup={{ group_id: selectedGroup?.id }}
            onClose={() => {
              setEditGroupOpen(false);
            }}
            finalFunction={onClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupInfo;
