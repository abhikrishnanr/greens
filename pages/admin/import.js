import { useState } from 'react';

export default function ImportServices() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return setMsg('Please select a file');

    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/import-services', {
      method: 'POST',
      body: form
    });
    const json = await res.json();
    setMsg(json.message || 'Done');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Import Services</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          name="file"    
          accept=".csv,.xlsx"
          onChange={e => setFile(e.target.files[0])}
        />
        <button
          type="submit"
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </form>
      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
