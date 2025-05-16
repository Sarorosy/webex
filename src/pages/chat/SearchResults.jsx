import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const SearchResults = ({
  searchOpen,
  query,
  searchResults,
  setSelectedMessage,
  onClose
}) => {
  const shouldShow = searchOpen && query.trim() !== "";

  

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 left-0 w-[28.6%] h-[100vh] bg-white shadow-xl border-l border-gray-300 z-50 overflow-y-auto"
        >
          

          <div className="p-4 py-2 border-b font-semibold text-lg bg-gray-300 flex justify-between items-center sticky top-0">
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
                className="p-3 hover:bg-gray-100 border-b text-sm text-gray-800 cursor-pointer"
              >
                <div className="text-xs text-gray-500 mb-1">
                  {msg.sender_name} –{" "}
                  {new Date(msg.created_at).toLocaleString()}
                </div>
                <div dangerouslySetInnerHTML={{ __html: msg.message }}></div>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500 italic">
              We can't find any messages that match your search.
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
