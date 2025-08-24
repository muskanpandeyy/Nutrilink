const signupForm = document.getElementById('signup-form');
const messageContainer = document.getElementById('message');  // Get the message container

signupForm.addEventListener('submit', function (event) {
  event.preventDefault();

  // Get form data
  const formData = new FormData(signupForm);
  const userData = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Send data to backend for signup
  fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        messageContainer.textContent = data.message;  // Display success message
        messageContainer.style.color = 'green';  // Style success message
        setTimeout(() => {
          window.location.href = 'login.html'; // Redirect to login page after success
        }, 2000);
      } else {
        messageContainer.textContent = data.message;  // Display error message
        messageContainer.style.color = 'red';  // Style error message
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      messageContainer.textContent = 'Something went wrong! Please try again.';
      messageContainer.style.color = 'red';
    });
});
