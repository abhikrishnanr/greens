'use client'
import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiTrash, FiLogOut } from "react-icons/fi";
import { MdDashboard, MdCheckCircle } from "react-icons/md";
import Header from "@/components/Header";

const holidays = [2]; // 2: Tuesday (holiday)
const availableCoupons = [
  { code: "WELCOME100", desc: "₹100 off for new customers!", discount: 100 },
  { code: "FREESHINE", desc: "Get a free Shine Serum with Hydra Facial.", discount: 0 }
];

export default function CartPage() {
  const { items: cart, remove, clear } = useCart();
  const { logout } = useAuth();
  const [date, setDate] = useState<Date | null>(null);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [customer, setCustomer] = useState<{ name: string, gender: string } | null>(null);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, desc: string, discount: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notes, setNotes] = useState("");

  function isDayDisabled(d: Date) {
    // Disable past dates and Tuesdays
    const today = new Date();
    today.setHours(0,0,0,0);
    return d < today || d.getDay() === 2;
  }

  function handleRemove(id: string) {
    remove(id);
  }
  function handleSendOtp() {
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSent(true);
    setError("");
  }
  async function handleVerifyOtp() {
    if (otp !== "123456") {
      setError("Invalid OTP! Try 123456.");
      return;
    }
    if (mobile === "9999999999") {
      setCustomer({ name: "Anjali Menon", gender: "Female" });
    } else {
      setCustomer(null);
    }
    setOtpVerified(true);
    setError("");
  }
  function handleApplyCoupon(code: string) {
    const found = availableCoupons.find(c => c.code === code.toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      setCouponCode("");
      setError("");
    } else {
      setError("Invalid coupon code.");
    }
  }
  function handleConfirmBooking() {
    setShowConfirmModal(true);
    clear();
    setNotes("");
  }
  function handleLogout() {
    logout();
    window.location.href = "/";
  }
  function gotoDashboard() {
    window.location.href = "/customer/dashboard";
  }

  const subtotal = cart.reduce((a, b) => a + b.price, 0);
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal - discount > 0 ? subtotal - discount : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05241a] via-[#03150d] to-[#0f3b27] text-white pb-12">
      <Header />

      <main className="max-w-lg mx-auto p-2 flex flex-col gap-6">
        {/* CART */}
        <section className="bg-[#062c1c] rounded-2xl shadow-xl p-4">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-yellow-200">
            <span className="bg-gradient-to-r from-green-600 to-yellow-300 rounded-lg px-2 py-1">Cart</span>
          </h2>
          {cart.length === 0 ? (
            <div className="text-gray-400 text-center py-6">Your cart is empty.</div>
          ) : (
            <ul>
              {cart.map(item => (
                <li key={item.id} className="flex items-center justify-between py-4 border-b border-green-900 last:border-b-0">
                  <div>
                    <div className="font-bold text-base text-lime-100">{item.name}</div>
                    <div className="text-xs text-lime-300">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-300 font-bold text-lg">₹{item.price}</span>
                    <button
                      className="hover:bg-red-700 bg-green-900 p-2 rounded-full transition"
                      onClick={() => handleRemove(item.id)}
                      title="Remove"
                    >
                      <FiTrash className="text-xl text-yellow-400" />
                    </button>
                  </div>
                </li>
              ))}
              <li className="flex justify-between font-bold text-lg mt-2 pt-3 border-t border-green-900">
                <span>Subtotal</span>
                <span className="text-yellow-200">₹{subtotal}</span>
              </li>
              {appliedCoupon && (
                <li className="flex justify-between mt-1 text-green-400 text-base">
                  <span>Coupon: {appliedCoupon.code}</span>
                  <span>-₹{appliedCoupon.discount}</span>
                </li>
              )}
              <li className="flex justify-between font-bold text-xl mt-2 pt-2 border-t border-green-700">
                <span>Total</span>
                <span className="text-yellow-300">₹{total}</span>
              </li>
            </ul>
          )}
        </section>

        {/* DATE PICKER */}
        <section className="bg-[#062c1c] rounded-2xl shadow-md p-4">
          <label className="block font-semibold mb-3 text-green-100">Choose Your Appointment Date</label>
          <DatePicker
  selected={date}
  onChange={setDate}
  minDate={new Date()}
  filterDate={(d: Date) => !isDayDisabled(d)}
  className="w-full rounded-md p-2 bg-[#23382b] border border-green-700 text-white mb-2"
  calendarClassName="!bg-[#23382b] !text-white"
  dayClassName={date =>
    !isDayDisabled(date) ? "available-day" : undefined
  }
  placeholderText="Select a date"
  dateFormat="EEE, dd MMM yyyy"
  showPopperArrow={false}
  popperPlacement="bottom"
  wrapperClassName="w-full"
/>
          <div className="text-xs text-yellow-300 mt-2">* Tuesdays and past dates are not available for booking.</div>
        </section>

        {/* MOBILE + OTP */}
        <section className="bg-[#062c1c] rounded-2xl shadow-md p-4">
          {!otpVerified ? (
            <>
              <label className="block font-semibold mb-2 text-green-100">Mobile Number</label>
              <input
                type="tel"
                className="w-full rounded-md p-3 bg-[#12281a] border border-lime-700 text-white mb-2 focus:ring-2 focus:ring-yellow-300"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/,""))}
                disabled={otpSent}
                autoFocus
              />
              {!otpSent ? (
                <button
  className="w-full bg-primary  text-black py-3 rounded-md font-bold shadow-lg hover:from-green-800 hover:to-lime-600 transition"
  onClick={handleSendOtp}
>
  Send OTP
</button>
              ) : (
                <>
                  <div className="mb-2 text-sm">Enter OTP <span className="font-mono bg-[#12281a] px-2 rounded text-yellow-300">123456</span></div>
                  <input
                    type="text"
                    className="w-full rounded-md p-3 bg-[#12281a] border border-lime-700 text-white mb-2 focus:ring-2 focus:ring-yellow-300"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/,""))}
                  />
                  <button className="w-full bg-primary  text-black py-3 rounded-md font-bold shadow-lg hover:from-cyan-700 hover:to-blue-500 transition" onClick={handleVerifyOtp}>
                    Verify OTP
                  </button>
                  <div className="text-xs text-yellow-300 mt-2">* Use demo OTP <b>123456</b></div>
                </>
              )}
              {error && <div className="text-red-400 mt-2">{error}</div>}
            </>
          ) : (
            <>
              {/* CUSTOMER DETAILS */}
              <h3 className="font-semibold text-lg mb-2 text-yellow-200">Customer Details</h3>
              {customer ? (
                <div className="mb-2">
                  <div>Name: <span className="font-bold">{customer.name}</span></div>
                  <div>Gender: <span className="font-bold">{customer.gender}</span></div>
                  <div>Mobile: <span className="font-mono">{mobile}</span></div>
                </div>
              ) : (
                <div className="text-gray-400 mb-2">No customer record found. Please fill in details during call confirmation.</div>
              )}

              {/* COUPON SECTION */}
              <div className="my-4">
                <div className="font-semibold mb-1 text-green-100">Available Coupons:</div>
                <ul>
                  {availableCoupons.map(c => (
                    <li key={c.code} className="flex items-center gap-2 mb-1">
                      <button
                        className={`bg-gradient-to-tr from-green-800 to-yellow-400 hover:from-green-700 hover:to-yellow-300 px-2 py-1 rounded text-sm font-bold mr-2 ${appliedCoupon?.code===c.code ? 'border-2 border-yellow-400' : ''}`}
                        onClick={()=>handleApplyCoupon(c.code)}
                        disabled={!!appliedCoupon && appliedCoupon.code===c.code}
                      >
                        {c.code}
                      </button>
                      <span className="text-lime-200">{c.desc}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="w-2/3 rounded-md p-2 bg-[#12281a] border border-lime-700 text-white"
                    placeholder="Have a coupon code?"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                  />
                  <button
                    className="bg-secondary px-4 rounded font-bold text-black shadow hover:from-blue-700 hover:to-cyan-500"
                    onClick={()=>handleApplyCoupon(couponCode)}
                  >Apply</button>
                </div>
                {appliedCoupon && (
                  <div className="text-green-400 mt-2 flex items-center gap-2">
                    <MdCheckCircle className="text-green-400 text-xl" />
                    Coupon <b>{appliedCoupon.code}</b> applied!
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="my-4">
                <label className="block font-semibold mb-1 text-green-100">Notes</label>
                <textarea
                  className="w-full rounded-md p-2 bg-[#12281a] border border-lime-700 text-white h-24"
                  placeholder="Any special requests? (optional)"
                  value={notes}
                  onChange={e=>setNotes(e.target.value)}
                />
              </div>

              <button
                className={`w-full bg-primary text-black py-3 rounded-md font-extrabold mt-2 shadow-lg hover:from-yellow-400 hover:to-lime-500 transition ${!date || cart.length===0 ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={handleConfirmBooking}
                disabled={!date || cart.length===0}
              >
                Confirm Booking Request
              </button>
              <div className="text-xs text-yellow-300 mt-3">* Our executive will call and confirm your request.<br/>Payments can be made at the shop.</div>
            </>
          )}
        </section>
      </main>

      {/* MODAL ON CONFIRM */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-[#12281a] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-green-800">
            <MdCheckCircle className="text-yellow-300 text-6xl mx-auto mb-2 animate-bounce" />
            <div className="text-2xl font-extrabold mb-1 bg-gradient-to-r from-green-200 via-yellow-200 to-lime-300 bg-clip-text text-transparent">
              Booking Requested!
            </div>
            <div className="mb-2 text-lg text-yellow-200">Our executive will call and confirm your request.</div>
            <div className="mb-4 text-sm text-gray-300">Payments can be made at the shop.<br/>Thank you for choosing <span className="text-yellow-300 font-bold">Greens Beauty Salon</span>!</div>
            <div className="flex gap-3 justify-center mt-4">
              <button
                className="flex items-center gap-1 bg-[#1a2c23] text-yellow-300 font-bold px-4 py-2 rounded-lg shadow hover:bg-green-900"
                onClick={gotoDashboard}
              >
                <MdDashboard className="text-xl" /> My Dashboard
              </button>
              <button
                className="flex items-center gap-1 bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-red-800"
                onClick={handleLogout}
              >
                <FiLogOut className="text-xl" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
