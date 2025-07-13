'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  FiSearch, FiEdit, FiTrash2, FiPlus, FiMove, FiArrowLeft
} from "react-icons/fi";

const WysiwygEditor = dynamic(() => import('../../../components/WysiwygEditor'), { ssr: false });

export default function ServicesAdminPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    mainServiceName: '',
    description: '',
    imageUrl: '',
    duration: '',
    order: 0
  });
  const [editing, setEditing] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [modalService, setModalService] = useState<any|null>(null);
  const fileInput = useRef();

  useEffect(() => { load(); }, [categoryId]);

  async function load() {
    const res = await fetch(`/api/admin/services/${categoryId}`);
    setServices(await res.json());
  }

  function onEdit(service) {
    setEditing(service.id);
    setForm({ ...service });
    setShowForm(true);
  }
  function onAddNew() {
    setEditing(null);
    setForm({ mainServiceName: '', description: '', imageUrl: '', duration: '', order: 0 });
    setShowForm(true);
  }

  async function save(e) {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/admin/service/${editing}`, {
        method: 'PUT',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      await fetch(`/api/admin/services/${categoryId}`, {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    setEditing(null);
    setShowForm(false);
    load();
  }

  async function del(id) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/admin/service/${id}`, {
      method: 'DELETE'
    });
    load();
  }

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const out = await res.json();
    setForm(f => ({ ...f, imageUrl: out.url }));
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(services);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setServices(items);
    // Update order in DB
    items.forEach((s, i) => {
      fetch(`/api/admin/service/${s.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...s, order: i }),
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }

  const filteredServices = search
    ? services.filter(s =>
        (s.mainServiceName || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : services;

  return (
    <div className="w-full mx-auto px-0 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8 px-4">
        <button
          className="text-secondary bg-zinc-800 p-2 rounded hover:text-primary"
          onClick={() => router.back()}
        ><FiArrowLeft size={22} /></button>
        <h1 className="text-3xl font-extrabold text-primary drop-shadow-lg tracking-tight">
          Services <span className="text-secondary text-lg font-normal">(Admin)</span>
        </h1>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 px-4">
        <div className="flex flex-1 items-center bg-black bg-opacity-60 rounded-lg p-2">
          <FiSearch className="text-primary text-lg mx-2" />
          <input
            className="bg-transparent w-full px-2 text-secondary placeholder:text-gray-400 outline-none"
            placeholder="Search service name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="bg-primary text-black flex items-center gap-2 px-5 py-2 rounded-full font-bold shadow hover:bg-green-400 transition"
          onClick={onAddNew}
        >
          <FiPlus /> Add Service
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <form
            onSubmit={save}
            className="bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl p-6 w-full max-w-lg space-y-5 relative"
            style={{ minWidth: 350 }}
          >
            <h2 className="text-xl font-bold mb-3 text-primary">{editing ? "Edit" : "Add"} Service</h2>
            <input
              value={form.mainServiceName}
              onChange={e=>setForm(f=>({...f, mainServiceName:e.target.value}))}
              className="w-full p-2 rounded bg-zinc-800 text-secondary border border-zinc-700"
              placeholder="Service Name"
              required
            />
            <WysiwygEditor
              value={form.description}
              onChange={val => setForm(f => ({ ...f, description: val }))}
              className="bg-black text-secondary border-zinc-700"
            />
            <input
              type="number"
              value={form.duration}
              onChange={e=>setForm(f=>({...f, duration:e.target.value}))}
              className="w-full p-2 rounded bg-zinc-800 text-secondary border border-zinc-700"
              placeholder="Duration (mins)"
              required
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInput}
              onChange={uploadImage}
              className="w-full p-2 bg-zinc-900 text-white border border-zinc-700"
            />
            {form.imageUrl && <img src={form.imageUrl} className="h-36 my-2 rounded shadow mx-auto" />}
            <div className="flex gap-4 pt-2">
              <button className="bg-primary text-black rounded px-5 py-2 font-bold" type="submit">
                {editing ? "Update" : "Add"}
              </button>
              <button onClick={()=>setShowForm(false)} className="text-red-500 px-4 py-2" type="button">Cancel</button>
            </div>
            <button type="button" className="absolute top-3 right-4 text-secondary text-lg" onClick={()=>setShowForm(false)}>&times;</button>
          </form>
        </div>
      )}

      {/* Read More Modal */}
      {modalService && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-4 right-4 text-2xl text-secondary hover:text-primary"
              onClick={() => setModalService(null)}
            >&times;</button>
            <div className="flex flex-col md:flex-row gap-6">
              {modalService.imageUrl && (
                <img
                  src={modalService.imageUrl}
                  className="w-56 h-56 object-cover rounded-xl border border-zinc-800 shadow mx-auto md:mx-0"
                  alt={modalService.mainServiceName + ' full'}
                />
              )}
              <div>
                <div className="font-bold text-primary text-2xl mb-2">{modalService.mainServiceName}</div>
                <div
                  dangerouslySetInnerHTML={{ __html: modalService.description }}
                  className="text-base text-secondary mt-1"
                />
                <div className="mt-4 text-secondary">
                  <b>Duration:</b> {modalService.duration} mins
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="services"
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 py-4"
              >
                {filteredServices.map((service, i) => (
                  <Draggable draggableId={service.id} index={i} key={service.id}>
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="bg-zinc-900 border border-zinc-800 shadow-md rounded-2xl flex flex-col items-center p-4 relative group"
                      >
                        {/* Drag handle */}
                        <div {...prov.dragHandleProps} className="absolute left-3 top-3 text-zinc-500 cursor-grab hover:text-primary">
                          <FiMove size={20} />
                        </div>
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            className="w-28 h-28 object-cover rounded-xl border border-zinc-800 shadow mb-3"
                            alt={service.mainServiceName + ' thumbnail'}
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-xl bg-zinc-800 flex items-center justify-center text-4xl text-zinc-700 mb-3">
                            <FiMove />
                          </div>
                        )}
                        <div className="font-bold text-primary text-lg mb-1 text-center">{service.mainServiceName}</div>
                        <div className="w-full text-center mb-3">
                          {service.description && (
                            <div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: service.description.length > 150
                                    ? service.description.substring(0, 150) + '...'
                                    : service.description
                                }}
                                className="text-xs text-secondary mt-1 line-clamp-3 min-h-[2.5em]"
                              />
                              {service.description.length > 150 && (
                                <button
                                  className="text-primary underline text-xs mt-1"
                                  onClick={() => setModalService(service)}
                                  type="button"
                                >
                                  Read more
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 justify-center w-full">
                          <button onClick={() => onEdit(service)} className="p-2 rounded text-yellow-400 hover:bg-zinc-800 transition" title="Edit">
                            <FiEdit size={18} />
                          </button>
                          <button onClick={() => del(service.id)} className="p-2 rounded text-red-400 hover:bg-zinc-800 transition" title="Delete">
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
