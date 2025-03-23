import { useState, useEffect } from "react";
import axios from "axios";

export default function LRUCacheVisualizer() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [cache, setCache] = useState([]);
  const [fetchedValue, setFetchedValue] = useState(null);

  useEffect(() => {
    fetchCache();
  }, []);

  const fetchCache = async () => {
    try {
      const res = await axios.get("http://localhost:4000/cache-state");
      setCache(res.data);
    } catch (error) {
      console.error("Error fetching cache state:", error);
    }
  };

  const handleInsert = async () => {
    if (!key || !value) return;
    await axios.post("http://localhost:4000/cache", { key, value });
    setKey("");
    setValue("");
    fetchCache();
  };

  const handleFetch = async () => {
    if (!key) return;
    try {
      const res = await axios.get(`http://localhost:4000/cache/${key}`);
      setFetchedValue(res.data.value);
    } catch (error) {
      setFetchedValue("Not Found");
    }
  };

  return (
    <div className="flex flex-col items-center p-10 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-10 mb-12">
        <h1 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          LRU Cache Visualizer
        </h1>
        
        {/* Control Panel */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl mb-12 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-800">Cache Controls</h2>
          
          {/* Insert Controls */}
          <div className="mb-8">
            <p className="text-sm text-indigo-600 mb-3 font-medium">Insert Item</p>
            <div className="flex flex-col sm:flex-row gap-6">
              <input
                type="number"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter Key"
                className="border border-indigo-200 p-4 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none flex-1 shadow-sm"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter Value"
                className="border border-indigo-200 p-4 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none flex-1 shadow-sm"
              />
              <button 
                onClick={handleInsert} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-md"
              >
                Insert
              </button>
            </div>
          </div>
          
          {/* Fetch Controls */}
          <div>
            <p className="text-sm text-indigo-600 mb-3 font-medium">Fetch Item</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={handleFetch} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-md w-full sm:w-auto"
              >
                Fetch Value
              </button>
              {fetchedValue !== null && (
                <div className="bg-white py-3 px-6 rounded-lg border border-indigo-200 shadow-sm">
                  <p className="text-lg">
                    <span className="font-medium">Value: </span>
                    <span className={fetchedValue === "Not Found" ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                      {fetchedValue}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Cache State */}
        <div>
          <h2 className="text-2xl font-semibold mb-8 text-indigo-800">Cache State</h2>
          {cache.length === 0 ? (
            <p className="text-gray-500 italic text-center py-6 text-lg">Cache is empty</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {cache.map((item, index) => (
                <div 
                  key={item.key} 
                  className={`p-6 bg-gradient-to-br ${
                    index % 3 === 0 ? "from-blue-50 to-indigo-100" : 
                    index % 3 === 1 ? "from-purple-50 to-pink-100" : 
                    "from-indigo-50 to-blue-100"
                  } border border-indigo-100 shadow-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <p className="mb-3">
                    <span className="font-semibold text-indigo-800">Key: </span>
                    <span className="text-indigo-600 font-medium">{item.key}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-indigo-800">Value: </span>
                    <span className="text-purple-600 font-medium">{item.value}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}