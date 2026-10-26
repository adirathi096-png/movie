import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api.js';
import { useBooking } from '../context/BookingContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Landmark,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const {
    selectedMovie,
    selectedCinema,
    selectedShowtime,
    selectedSeats,
    reservation,
    pricing,
    resetBookingFlow,
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('demo_checkout');
  const [processing, setProcessing] = useState(false);

  // Form states for simulated cards
  const [cardName, setCardName] = useState('Aditya Demo');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [upiId, setUpiId] = useState('demo@upi');

  const payableTotal = location.state?.finalTotal || pricing.totalAmount;

  if (!selectedSeats || selectedSeats.length === 0 || !selectedShowtime) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white mb-3">No Active Booking Session</h3>
        <Link to="/now-showing" className="btn btn-primary-imovies">
          Return to Movies
        </Link>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setProcessing(true);

      const payload = {
        showtimeId: selectedShowtime._id || selectedShowtime.id,
        reservationId: reservation?.reservationId || reservation?.id,
        seatIds: selectedSeats.map((s) => s.seatId),
        paymentMethod,
      };

      const res = await bookingsAPI.createBooking(payload);

      if (res.success && res.data.booking) {
        // Trigger celebratory confetti animation
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore if canvas-confetti is not loaded
        }

        showToast('Payment successful! Your tickets are confirmed.', 'success');
        const bookingId = res.data.booking._id;

        // Clean active hold state
        await resetBookingFlow();

        navigate(`/booking/confirmation/${bookingId}`, {
          state: { booking: res.data.booking },
        });
      }
    } catch (err) {
      showToast(err.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <button
          className="btn btn-sm btn-link text-secondary text-decoration-none p-0 mb-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="me-1" /> Back to Summary
        </button>
        <h1 className="text-white fw-black tracking-tight mb-1">Secure Checkout</h1>
        <p className="text-secondary small">
          Choose your payment method below. Transparent sandbox payment simulation for testing.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Payment Method Selection */}
        <div className="col-lg-8">
          <div className="glass-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <Lock size={18} color="var(--accent-emerald)" /> Select Payment Gateway
            </h5>

            {/* Payment Method Selector Tabs */}
            <div className="row g-3 mb-4">
              <div className="col-md-6 col-12">
                <button
                  type="button"
                  className={`p-3 rounded-3 w-100 text-start border transition-all ${
                    paymentMethod === 'demo_checkout'
                      ? 'border-primary bg-primary bg-opacity-10 text-white shadow'
                      : 'border-secondary bg-dark text-secondary hover-border-cyan'
                  }`}
                  onClick={() => setPaymentMethod('demo_checkout')}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Sparkles size={18} color="var(--accent-cyan)" />
                    <strong className="text-white">Instant Demo Checkout</strong>
                  </div>
                  <div className="small text-muted">Recommended for 1-click test confirmation</div>
                </button>
              </div>

              <div className="col-md-6 col-12">
                <button
                  type="button"
                  className={`p-3 rounded-3 w-100 text-start border transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-primary bg-primary bg-opacity-10 text-white shadow'
                      : 'border-secondary bg-dark text-secondary hover-border-cyan'
                  }`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <CreditCard size={18} color="var(--accent-amber)" />
                    <strong className="text-white">Card Payment (Sandbox)</strong>
                  </div>
                  <div className="small text-muted">Visa, Mastercard, RuPay simulation</div>
                </button>
              </div>

              <div className="col-md-6 col-12">
                <button
                  type="button"
                  className={`p-3 rounded-3 w-100 text-start border transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-primary bg-primary bg-opacity-10 text-white shadow'
                      : 'border-secondary bg-dark text-secondary hover-border-cyan'
                  }`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <QrCode size={18} color="var(--accent-emerald)" />
                    <strong className="text-white">UPI / QR Code</strong>
                  </div>
                  <div className="small text-muted">Google Pay, PhonePe, Paytm simulation</div>
                </button>
              </div>

              <div className="col-md-6 col-12">
                <button
                  type="button"
                  className={`p-3 rounded-3 w-100 text-start border transition-all ${
                    paymentMethod === 'net_banking'
                      ? 'border-primary bg-primary bg-opacity-10 text-white shadow'
                      : 'border-secondary bg-dark text-secondary hover-border-cyan'
                  }`}
                  onClick={() => setPaymentMethod('net_banking')}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Landmark size={18} color="#c084fc" />
                    <strong className="text-white">Net Banking</strong>
                  </div>
                  <div className="small text-muted">HDFC, ICICI, SBI, Axis simulation</div>
                </button>
              </div>
            </div>

            {/* Payment Details Container */}
            <div className="p-4 rounded-3 bg-dark border border-secondary mb-4">
              {paymentMethod === 'demo_checkout' && (
                <div>
                  <div className="d-flex align-items-center gap-2 text-warning fw-semibold mb-2">
                    <Sparkles size={18} /> Sandbox Demonstration Mode Active
                  </div>
                  <p className="text-secondary small mb-3 leading-relaxed">
                    This mode verifies server-side seat reservations, atomic availability checks, price calculations, and generates genuine confirmed booking tickets with unique references and QR representations without requiring live card numbers.
                  </p>
                  <div className="d-flex align-items-center gap-2 text-success small">
                    <CheckCircle2 size={16} /> Ready to confirm {selectedSeats.length} ticket(s) instantly.
                  </div>
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <div>
                  <h6 className="text-white fw-bold mb-3">Card Information (Sandbox)</h6>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="text-muted small mb-1">Name on Card</label>
                      <input
                        type="text"
                        className="form-control imovies-input"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="text-muted small mb-1">Card Number</label>
                      <input
                        type="text"
                        className="form-control imovies-input font-monospace"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small mb-1">Expiry</label>
                      <input
                        type="text"
                        className="form-control imovies-input font-monospace"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div>
                  <h6 className="text-white fw-bold mb-3">UPI ID (Sandbox)</h6>
                  <div className="mb-3">
                    <label className="text-muted small mb-1">Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      className="form-control imovies-input"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                  <div className="text-secondary small">
                    A test payment request will be auto-approved on confirmation.
                  </div>
                </div>
              )}

              {paymentMethod === 'net_banking' && (
                <div>
                  <h6 className="text-white fw-bold mb-3">Select Bank (Sandbox)</h6>
                  <select className="form-select imovies-input">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="d-flex align-items-center gap-2 text-secondary small">
              <ShieldCheck size={18} color="var(--accent-emerald)" />
              <span>256-Bit SSL Encrypted Checkout. Verified by IMovies Concurrency Engine.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Confirmation Box */}
        <div className="col-lg-4">
          <div className="glass-card p-4">
            <h5 className="text-white fw-bold mb-3">Order Summary</h5>

            <div className="mb-3 pb-3 border-bottom border-secondary">
              <h6 className="text-white mb-1">{selectedMovie?.title}</h6>
              <div className="text-secondary small">{selectedCinema?.name}</div>
              <div className="text-muted small">
                {selectedSeats.length} Seats: {selectedSeats.map((s) => s.seatId).join(', ')}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted small">Payable Now</span>
              <span className="fs-3 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                ₹{payableTotal}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary-imovies w-100 py-3 fs-6 justify-content-center"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Verifying & Locking Seats...
                </>
              ) : (
                `Pay ₹${payableTotal} & Confirm`
              )}
            </button>

            <div className="text-center mt-3">
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Instant e-ticket generation with QR code upon confirmation.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
