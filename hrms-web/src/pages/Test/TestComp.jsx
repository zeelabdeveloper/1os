import React from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();

function TestComp() {
  const [enabled, setEnabled] = React.useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['test-data'],
    queryFn: async () => {
    
      return new Promise((resolve) =>
        setTimeout(() => resolve("📦 Local static data returned!"), 1000)
      );
    },
    enabled,  
  });
console.log( data)
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4">
        <button
          onClick={() => alert(true)}
          className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded"
        >
          + Click to Load Local Data
        </button>

        <div className="mt-4  text-lg">
          {isLoading && <p>⏳ Loading...</p>}
          {isError && <p>❌ Error fetching data</p>}
          {data && <p>✅ Data: {data}</p>}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default TestComp;
