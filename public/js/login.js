$("#loginBtn").click(function () {
    $.ajax({
        url: "/login",
        type: "POST",
        data: {
            email: $("#email").val(),
            password: $("#password").val()
        },
        success: function (response) {

            // Email doesn’t exist
            if (response == "NoEmailExist") {
                document.getElementById("loginErrorMessage").style.display = "block";
                document.getElementById("loginErrorMessage").innerHTML =
                    "User with that email does not exist";
                return;
            }

            // Wrong password
            if (response == "wrongPassword") {
                document.getElementById("loginErrorMessage").style.display = "block";
                document.getElementById("loginErrorMessage").innerHTML =
                    "Incorrect Password";
                return;
            }

            // Admin login
            if (response.isAdmin) {
                document.getElementById("loginErrorMessage").style.display = "none";
                document.getElementById("loginSuccessModal").style.display = "flex";
                document.body.style.overflow = "hidden";

                setTimeout(() => {
                    window.location = "/admin-dashboard";
                }, 2500);
                return;
            }

            // Normal user
            document.getElementById("loginErrorMessage").style.display = "none";
            document.getElementById("loginSuccessModal").style.display = "flex";
            document.body.style.overflow = "hidden";

            setTimeout(() => {
                window.location = "/";
            }, 2500);
        }
    });
});

// Enter key triggers login
const inputs = document.querySelectorAll(".form-control");
inputs.forEach(input => {
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("loginBtn").click();
        }
    });
});
