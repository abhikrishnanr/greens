'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Toaster, toast } from 'sonner';

interface Branch { id: string; name: string; }
interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  designation: string;
  experience?: string;
  startDate: string;
  role: string;
  branchId?: string;
  branch?: Branch;
  removed: boolean;
  createdAt: string;
  imageUrl?: string;
}

export default function StaffPage() {
  // state
  const [staffList, setStaffList]         = useState<Staff[]>([]);
  const [branches, setBranches]           = useState<Branch[]>([]);
  const [filter, setFilter]               = useState<'ALL'|'AVAILABLE'|'REMOVED'>('ALL');
  const [searchTerm, setSearchTerm]       = useState('');
  const [showAddModal, setShowAddModal]   = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff|null>(null);
  const [existingCustomer, setExistingCustomer] = useState<Partial<Staff>|null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  // fetch data
  const fetchStaff = async() => {
    const res = await fetch('/api/staff');
    const { success, staff } = await res.json();
    if (success) setStaffList(staff);
  };
  const fetchBranches = async() => {
    const res = await fetch('/api/branch');
    const { success, branches } = await res.json();
    if (success) setBranches(branches);
  };
  useEffect(()=>{
    fetchStaff();
    fetchBranches();
  }, []);

  // handlers
  const handleToggle = async(id:string, curr:boolean) => {
    await fetch('/api/staff/toggle', {
      method:'POST',
      body: JSON.stringify({ id, removed: !curr })
    });
    fetchStaff();
  };

const handleExport = () => {
  const headers = [
    'Name','Email','Phone','Gender','DOB','Address',
    'Designation','Experience','Start Date','Role',
    'Branch','Removed','Joined'
  ];

  const rows = staffList.map(s => [
    s.name,
    s.email,
    s.phone,
    s.gender,
    s.dob,
    s.address,
    s.designation,
    s.experience,
    s.startDate,
    s.role,
    s.branch?.name,
    s.removed ? 'Yes' : 'No',
    new Date(s.createdAt).toLocaleDateString(),
  ]);

  // Map through every cell, coerce null/undefined to '', then escape quotes
  const csv = [headers, ...rows]
    .map(row =>
      row
        .map(cell => {
          const text = String(cell ?? '');
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'staff_export.csv';
  a.click();
  URL.revokeObjectURL(url);
};

  // filtered & searched
  const filtered = staffList
    .filter(s => {
      if (filter === 'ALL') return true;
      return filter === 'REMOVED' ? s.removed : !s.removed;
    })
    .filter(s=> {
      const q = searchTerm.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });

  const handlePhoneCheck = async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if (!/^\d{10}$/.test(newPhone)) {
      toast.error('Phone must be 10 digits');
      return;
    }
    const res = await fetch(`/api/staff/check?phone=${newPhone}`);
    const data = await res.json();
    if (data.exists) {
      if (data.user.role !== 'customer') {
        toast.error('User already staff');
        return;
      }
      const ok = window.confirm('Customer exists with this number. Add as staff?');
      if (!ok) return;
      setExistingCustomer(data.user);
    } else {
      setExistingCustomer(null);
    }
    setPhoneVerified(true);
  };

  // Add Staff
  const handleAdd = async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const phone = fd.get('phone') as string;
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone must be 10 digits');
      return;
    }
    let res: Response;
    if (existingCustomer) {
      fd.append('id', existingCustomer.id);
      const role = fd.get('role');
      if (role === 'staff') {
        fd.set('role', 'customer_staff');
      }
      res = await fetch('/api/staff/update',{ method:'POST', body: fd });
    } else {
      res = await fetch('/api/staff/add',{ method:'POST', body: fd });
    }
    const { success } = await res.json();
    if (success) {
      toast.success('Staff added!');
      form.reset();
      setShowAddModal(false);
      setPhoneVerified(false);
      setExistingCustomer(null);
      setNewPhone('');
      fetchStaff();
    } else {
      toast.error('Failed to add');
    }
  };

  // Edit Staff
  const handleEdit = async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const phone = fd.get('phone') as string;
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone must be 10 digits');
      return;
    }
    fd.append('id', selectedStaff!.id);
    const res = await fetch('/api/staff/update',{
      method:'POST', body: fd
    });
    const { success } = await res.json();
    if (success) {
      toast.success('Staff updated!');
      setSelectedStaff(null);
      fetchStaff();
    } else {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <Toaster richColors position="top-center"/>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <div className="space-x-2">
          <button
            onClick={()=>setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            + Add Staff
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Export CSV
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search staff..."
          value={searchTerm}
          onChange={e=>setSearchTerm(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-200 border border-gray-300"
        />
        <div className="space-x-2">
          {['ALL','AVAILABLE','REMOVED'].map(val=>(
            <button
              key={val}
              onClick={()=>setFilter(val as any)}
              className={`px-3 py-1 rounded ${
                filter===val?'bg-indigo-600':'bg-gray-200'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}
      >
        {filtered.map(staff=>(
          <div
            key={staff.id}
            className="bg-white p-6 rounded-xl border border-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            <div className="flex justify-center mb-6">
               <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                {staff.imageUrl
                   ? <img src={staff.imageUrl} className="w-full h-full object-cover"/>
                   : <span className="block w-full h-full text-2xl text-center leading-14">
                       {staff.name[0].toUpperCase()}
                     </span>
                 }
              </div>
              
            </div>
            <div className="flex justify-center mb-6">
 <h1 className="text-3xl font-semibold">{staff.name}</h1></div>
            <table className="w-full text-base mb-6 bg-white rounded shadow border">
              <tbody>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Email</th>
                  <td>{staff.email}</td>
                </tr>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Phone</th>
                  <td>{staff.phone}</td>
                </tr>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Gender</th>
                  <td>{staff.gender}</td>
                </tr>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">DOB</th>
                  <td>{new Date(staff.dob).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Address</th>
                  <td>{staff.address}</td>
                </tr>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Designation</th>
                  <td>{staff.designation}</td>
                </tr>
                {staff.experience && (
                  <tr>
                    <th className="text-left pr-4 py-1 font-medium">Experience</th>
                    <td>{staff.experience}</td>
                  </tr>
                )}
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Start Date</th>
                  <td>{new Date(staff.startDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Branch</th>
                  <td>{staff.branch?.name||'—'}</td>
                </tr>
                <tr>
                  <th className="text-left pr-4 py-1 font-medium">Removed</th>
                  <td>{staff.removed ? 'Yes' : 'No'}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex gap-2">
              <button
                onClick={()=>setSelectedStaff(staff)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded text-lg"
              >
                Edit
              </button>
              <button
                onClick={()=>handleToggle(staff.id, staff.removed)}
                className={`flex-1 py-2 rounded text-lg ${
                  staff.removed
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {staff.removed ? 'Restore' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl border border-gray-300 overflow-auto max-h-[90vh]">
            <h2 className="text-2xl mb-4">Add New Staff</h2>
            {!phoneVerified ? (
              <form onSubmit={handlePhoneCheck} className="grid grid-cols-2 gap-4 text-gray-900">
                <div className="col-span-2">
                  <label className="block mb-1">Phone*</label>
                  <input
                    value={newPhone}
                    onChange={e=>setNewPhone(e.target.value)}
                    required maxLength={10} pattern="\d{10}"
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={()=>{setShowAddModal(false);setNewPhone('');setPhoneVerified(false);setExistingCustomer(null);}}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-600 rounded">
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleAdd}
                encType="multipart/form-data"
                className="grid grid-cols-2 gap-4 text-gray-900"
              >
                {/* Profile Pic */}
                <div className="col-span-2">
                  <label className="block mb-1">Profile Pic</label>
                  <input type="file" name="image" accept="image/*" className="w-full"/>
                  <small className="text-gray-400">optional JPG/PNG</small>
                </div>
                {/* Name */}
                <div>
                  <label className="block mb-1">Name*</label>
                  <input
                    name="name"
                    defaultValue={existingCustomer?.name}
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block mb-1">Email*</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={existingCustomer?.email}
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block mb-1">Phone*</label>
                  <input
                    name="phone"
                    value={newPhone}
                    readOnly
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Gender */}
                <div>
                  <label className="block mb-1">Gender*</label>
                  <select
                    name="gender"
                    defaultValue={existingCustomer?.gender || ''}
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  >
                    <option value="">— select —</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                {/* DOB */}
                <div>
                  <label className="block mb-1">DOB*</label>
                  <input
                    name="dob"
                    type="date"
                    defaultValue={existingCustomer?.dob?.split?.('T')[0]}
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Address */}
                <div className="col-span-2">
                  <label className="block mb-1">Address*</label>
                  <input
                    name="address"
                    defaultValue={existingCustomer?.address}
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Designation */}
                <div>
                  <label className="block mb-1">Designation*</label>
                  <input
                    name="designation"
                    defaultValue={existingCustomer?.designation}
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Experience */}
                <div>
                  <label className="block mb-1">Experience</label>
                  <input
                    name="experience"
                    defaultValue={existingCustomer?.experience}
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Start Date */}
                <div>
                  <label className="block mb-1">Start Date*</label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  />
                </div>
                {/* Role */}
                <div>
                  <label className="block mb-1">Role*</label>
                  <select
                    name="role"
                    defaultValue="staff"
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  >
                    <option value="staff">staff</option>
                    <option value="customer_staff">staff & customer</option>
                    <option value="manager">manager</option>
                  </select>
                </div>
                {/* Branch */}
                <div>
                  <label className="block mb-1">Branch*</label>
                  <select
                    name="branchId"
                    required
                    className="w-full p-2 rounded bg-gray-200"
                  >
                    <option value="">— select —</option>
                    {branches.map(b=>(
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                {/* Buttons */}
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={()=>{setShowAddModal(false);setPhoneVerified(false);setExistingCustomer(null);setNewPhone('');}}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 rounded"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl border border-gray-300 overflow-auto max-h-[90vh]">
            <h2 className="text-2xl mb-4">Edit Staff</h2>
            <form
              onSubmit={handleEdit}
              encType="multipart/form-data"
              className="grid grid-cols-2 gap-4 text-gray-900"
            >
              {/* Profile Pic */}
              <div className="col-span-2">
                <label className="block mb-1">Profile Pic</label>
                <input type="file" name="image" accept="image/*" className="w-full"/>
                <small className="text-gray-400">Leave blank to keep current</small>
              </div>

              <input type="hidden" name="id" value={selectedStaff.id}/>

              {/* Name */}
              <div>
                <label className="block mb-1">Name*</label>
                <input
                  name="name"
                  defaultValue={selectedStaff.name}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1">Email*</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={selectedStaff.email}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-1">Phone*</label>
                <input
                  name="phone"
                  defaultValue={selectedStaff.phone}
                  required maxLength={10} pattern="\d{10}"
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-1">Gender*</label>
                <select
                  name="gender"
                  defaultValue={selectedStaff.gender}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                >
                  <option value="">— select —</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              {/* DOB */}
              <div>
                <label className="block mb-1">DOB*</label>
                <input
                  name="dob"
                  type="date"
                  defaultValue={selectedStaff.dob?.split('T')[0]}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block mb-1">Address*</label>
                <input
                  name="address"
                  defaultValue={selectedStaff.address}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block mb-1">Designation*</label>
                <input
                  name="designation"
                  defaultValue={selectedStaff.designation}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block mb-1">Experience</label>
                <input
                  name="experience"
                  defaultValue={selectedStaff.experience}
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block mb-1">Start Date*</label>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={selectedStaff.startDate?.split('T')[0]}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block mb-1">Role*</label>
                <select
                  name="role"
                  defaultValue={selectedStaff.role}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                >
                  <option value="staff">staff</option>
                  <option value="customer_staff">staff & customer</option>
                  <option value="manager">manager</option>
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block mb-1">Branch*</label>
                <select
                  name="branchId"
                  defaultValue={selectedStaff.branchId||''}
                  required
                  className="w-full p-2 rounded bg-gray-100"
                >
                  <option value="">— select —</option>
                  {branches.map(b=>(
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={()=>setSelectedStaff(null)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
