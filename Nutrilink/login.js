// document.getElementById("login-form").addEventListener("submit", function (e) {
//     e.preventDefault();
  
//     const email = document.querySelector("input[type='email']").value;
//     const password = document.querySelector("input[type='password']").value;
  
//     fetch("http://localhost:5000/api/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.message === "Login successful!") {
//           alert("Login successful!");
//           window.location.href = "index.html"; // Redirect to home
//         } else {
//           alert(data.message); // e.g. "Invalid email or password"
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//         alert("Something went wrong. Please try again.");
//       });
//   });
  






const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'block';
}

function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearError();

    const formData = new FormData(loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (data.success) {
            // Store user session info if needed
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'panel.html';
        } else {
            showError(data.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Something went wrong! Please try again.');
    }
});
