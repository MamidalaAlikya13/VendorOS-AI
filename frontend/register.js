const registerForm = document.getElementById("registerForm");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const registerMessage =
    document.getElementById("registerMessage");


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


// Show / Hide Confirm Password
toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPasswordInput.type === "password") {
        confirmPasswordInput.type = "text";
        toggleConfirmPassword.textContent = "🙈";
    } else {
        confirmPasswordInput.type = "password";
        toggleConfirmPassword.textContent = "👁";
    }

});


// Register
registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = document.getElementById("role").value;


    // Password match check
    if (password !== confirmPassword) {

        registerMessage.textContent =
            "Passwords do not match.";

        registerMessage.style.color = "#dc2626";

        return;
    }


    registerMessage.textContent =
        "Creating your account...";

    registerMessage.style.color = "#64748b";


    try {

        const response = await fetch(
            "https://vendoros-ai-backend.onrender.com/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: role
                })
            }
        );


        const data = await response.json();


        if (
            response.ok &&
            data.message === "User registered successfully"
        ) {

            registerMessage.textContent =
                "Account created successfully!";

            registerMessage.style.color = "#16a34a";


            setTimeout(() => {

                window.location.href = "login.html";

            }, 1000);


        } else {

            registerMessage.textContent =
                data.message || "Unable to create account.";

            registerMessage.style.color = "#dc2626";

        }


    } catch (error) {

        console.error(error);

        registerMessage.textContent =
            "Unable to connect to the server.";

        registerMessage.style.color = "#dc2626";

    }

});