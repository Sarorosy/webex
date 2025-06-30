import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../../utils/idb";

const SearchResults = ({
  searchOpen,
  query,
  searchResults,
  setSelectedMessage,
  searchLoading,
  onClose
}) => {
  const shouldShow = searchOpen && query.trim() !== "";
  const {theme} = useAuth();

  

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "tween", duration: 0.3 }}
          className={`fixed top-0 left-0 w-[24.6%] h-[100vh] ${theme == "dark" ? "bg-gray-800 text-white mw-dark" : "bg-white text-black"} shadow-xl border-l border-gray-300 z-[100] overflow-y-auto prose`}
        >
          

          <div className={`p-4 py-2 border-b font-semibold text-lg flex justify-between items-center sticky top-0
            ${theme == "dark" ? "bg-gray-500 text-white mw-dark" : "bg-gray-300 text-black"}
          `}>
            <span>Search Results</span>
            <button
              onClick={onClose}
              className="text-sm text-white bg-orange-600 px-1 py-1 rounded"
            >
              <X size={13}/>
            </button>
          </div>

          {searchResults.length > 0 ? (
            searchResults.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-3  border-b text-sm ${theme == "dark" ? " text-white hover:bg-gray-700 " : "text-gray-800 hover:bg-gray-100"} cursor-pointer f-13`}
              >
                <div className={`text-xs  mb-1 ${theme == "dark" ? " text-gray-300" : "text-gray-500"} `}>
                  {msg.sender_name} –{" "}
                  {new Date(msg.created_at).toLocaleString()}
                </div>
                <div dangerouslySetInnerHTML={{ __html: msg.message }}></div>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500 italic">
             {searchLoading ? "Loading..." : " We can't find any messages that match your search."}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
