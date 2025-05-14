import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../../utils/idb";
import AddMembers from "./AddMembers";
import InviteMembers from "./InviteMembers";
import toast from "react-hot-toast";

const GroupInfo = ({ selectedGroup, onClose }) => {

  console.log(selectedGroup)
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const { user } = useAuth();

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleAddMemberClick = (groupId) => {
    setSelectedGroupId(groupId);
    setAddMemberOpen(true);
  }

  const handleInviteMemberClick = (groupId) => {
    setSelectedGroupId(groupId);
    setInviteMemberOpen(true);
  }

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupRes = await fetch(`http://localhost:5000/api/groups/group/${selectedGroup.id}`);
        const groupData = await groupRes.json();
        if (groupData.status) setGroup(groupData.group);
        setLoadingGroup(false);

        const membersRes = await fetch(`http://localhost:5000/api/groups/members/${selectedGroup.id}`);
        const membersData = await membersRes.json();
        if (membersData.status) setMembers(membersData.members);
        setLoadingMembers(false);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setLoadingGroup(false);
        setLoadingMembers(false);
      }
    };

    fetchGroupData();
  }, [selectedGroup]);

  const handleSendRequest = async() =>{
    try{
      const response = await fetch("http://localhost:5000/api/grouplimit/send",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_id: selectedGroup.id,
            sender_id: user.id
            })
      })
      const data = await response.json()
      if(data.status){
        toast.success(data.message || "Request Sent Succesfully");
        onClose()
      }else{
        toast.error(data.message || "Failed to send request");
      }
    }catch{
      console.error("Error sending request");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end justify-center">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "5%" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white rounded-t-3xl w-full max-w-2xl h-[90%] overflow-y-auto shadow-xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
        >
          <X size={24} />
        </button>

        {/* Banner */}
        <div className="w-full h-32 bg-orange-300 rounded-t-3xl" />

        {/* Group Info Card */}
        <div className="px-6 -mt-12">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-2xl font-bold text-gray-800">{selectedGroup?.name}</h2>
            {loadingGroup ? (
              <>
                <Skeleton height={28} width={160} className="mb-2" />
                <Skeleton count={2} />
              </>
            ) : (
              <>
                <p className="text-gray-600 mt-1 mb-3">{group.description}</p>
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                  <div>
                    <span className="font-medium text-gray-700">Created by:</span>{" "}
                    {group.created_by_username}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Member Limit:</span>{" "}
                    {group.member_limit}
                  </div>
                  {!loadingMembers && (
                    group.member_limit == members.length ? (
                      <div className="flex items-center">
                        <span className="font-medium text-red-500 bg-red-100 px-1 py-1 rounded">Member Limit Full</span>{" "}
                        <span className="ml-2">
                          <button className="bg-orange-500 text-white px-2 py-1 rounded"
                          onClick={handleSendRequest}
                          >Send Request</button> to Increase Limit ?
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">

                      <button 
                      onClick={()=>{handleAddMemberClick(selectedGroup?.id)}}
                      className="bg-orange-500 text-white px-2 py-1 rounded">Add Member(s)</button>

                      <button 
                      onClick={()=>{handleInviteMemberClick(selectedGroup?.id)}}
                      className="bg-orange-500 text-white px-2 py-1 rounded">Invite Member(s)</button>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="px-6 mt-6 pb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Members</h3>

          {loadingMembers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl shadow-sm">
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
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {member.profile_pic ? (
                      <img
                        src={`http://localhost:5000${member.profile_pic}`}
                        alt={member.name}
                        className="w-10 h-full object-cover"
                      />
                    ) : (
                      member.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
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
          <AddMembers groupId={selectedGroupId} onClose={()=>{setAddMemberOpen(false)}} onSelect={(ids) => console.log(ids)} members={members} />

        )}

        {inviteMemberOpen && (
          <InviteMembers groupId={selectedGroupId} onClose={()=>{setInviteMemberOpen(false)}} onSelect={(ids) => console.log(ids)} members={members} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupInfo;
