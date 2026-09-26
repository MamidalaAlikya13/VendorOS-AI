const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");


// Show / Hide Password
togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "👁";
    }
});


// Login
loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    loginMessage.textContent = "Signing in...";
    loginMessage.style.color = "#64748b";

    try {

        const response = await fetch(
            `https://vendoros-ai-backend.onrender.com/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (response.ok && data.message === "Login successful") {

            localStorage.setItem(
                "vendoros_user",
                JSON.stringify(data)
            );

            localStorage.setItem(
                "user_id",
                String(data.user_id)
            );

            localStorage.setItem(
                "user_role",
                data.role || "retailer"
            );

            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "#16a34a";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 700);

        } else {

            loginMessage.textContent =
                data.message || "Invalid email or password.";

            loginMessage.style.color = "#dc2626";
        }

    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            "Unable to connect to the server.";

        loginMessage.style.color = "#dc2626";
    }
});