// document.getElementById('donation-form').addEventListener('submit', function(event) {
//     event.preventDefault();
  
//     const donor = document.getElementById('donor').value;
//     const type = document.getElementById('donation-type').value;
//     const quantity = document.getElementById('quantity').value;
//     const date = new Date().toLocaleDateString();
  
//     if (!donor || !quantity) {
//       alert("Please fill in all fields.");
//       return;
//     }
  
//     const donation = { donor, type, quantity, date };
  
//     let donations = JSON.parse(localStorage.getItem('donations')) || [];
//     donations.push(donation);
//     localStorage.setItem('donations', JSON.stringify(donations));
  
  
//     alert(`Thank you, ${donor},for your ${type} donation of ${quantity}`);
//     document.getElementById('donation-form').reset();
//   });