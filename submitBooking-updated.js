// Replace your existing submitBooking() function in booking.html with this one.
// It logs the booking to Google Sheets, then opens the WhatsApp confirmation as before.

const SHEET_WEBHOOK_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

function submitBooking(){
  if(!state.name.trim() || !state.phone.trim()){
    alert('Please add your name and phone number.');
    return;
  }
  const services = state.selected.map(id=>SERVICES.find(s=>s.id===id).name).join(', ');
  const total = state.selected.reduce((sum,id)=> sum + SERVICES.find(x=>x.id===id).price, 0);
  const dateStr = DATES[state.dateIdx].toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'});
  const msg = `Hi ${STORE_NAME}! I'd like to book:\n${services}\n${dateStr} at ${state.time}\nName: ${state.name}\nPhone: ${state.phone}${state.notes?'\nNotes: '+state.notes:''}\nTotal: ${money(total)}`;
  const waLink = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`;

  // Log booking to Google Sheets (fire-and-forget, no-cors since Apps Script doesn't return CORS headers)
  fetch(SHEET_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      name: state.name,
      phone: state.phone,
      services: services,
      date: dateStr,
      time: state.time,
      total: total,
      notes: state.notes
    })
  }).catch(err => console.warn('Sheet log failed silently:', err));

  document.getElementById('card').innerHTML = `
    <div class="confirm-box">
      <div class="confirm-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <h2>Almost there, ${state.name.split(' ')[0]}</h2>
      <p>Tap below to send your booking request on WhatsApp — we'll confirm your chair right there.</p>
      <a class="wa-btn" href="${waLink}" target="_blank">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.07-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.6 0-3.1-.44-4.38-1.2l-.31-.18-3 .78.8-2.93-.2-.3A7.94 7.94 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/></svg>
        Send on WhatsApp
      </a>
    </div>
  `;
}
