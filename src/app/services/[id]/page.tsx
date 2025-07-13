// app/services/[id]/page.tsx
export default async function ServiceDetailsPage({ params }) {
  const { id } = params;
  const res = await fetch(`/api/services/${id}`);
  const service = await res.json();

  if (!service || !service.id) {
    return <div className="text-red-500 text-xl p-8">Category not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-12 bg-black rounded-2xl p-8 shadow">
      <h1 className="text-3xl font-bold mb-3 text-primary">{service.main_service_name}</h1>
      <div className="mb-2 text-green-400 font-semibold">{service.sub_category}</div>
      <div className="text-base text-green-200 mb-4" dangerouslySetInnerHTML={{ __html: service.description || '' }} />
      {/* Add more fields as you wish */}
      <div className="mt-6">
        <b>Category:</b> {service.main_service_name}<br/>
        <b>Sub-category:</b> {service.sub_category}
      </div>
    </div>
  );
}
