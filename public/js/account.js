/**
 * Helper variables to get certain values from forms.
 */
var profileImgBtn = document.getElementById('profileImage');
var profileFile = document.getElementById('profileFile');
const deleteUserModal = document.getElementById("deleteAccountModal");
var currentType;

/**
 * When profile image clicked, call onclick function for uploading image file.
 */
profileImgBtn.addEventListener('click', function () {
    profileFile.click();
});

/**
 * Image uploader function that allows user to choose an image locally to uplaod and update their profile picture.
 */
profileFile.addEventListener('change', function () {
    const choosedFile = this.files[0];
    if (choosedFile) {
        const reader = new FileReader();
        reader.addEventListener('load', function () {
            profileImgBtn.setAttribute('src', reader.result);
        });
        reader.readAsDataURL(choosedFile);
    }
});

/**
 * AJAX call to retreive the logged in user's info and display in each field on user profile page.
 */
$.ajax({
    url: '/getUserInfo',
    type: "GET",
    success: function (data) {
        currentType = data.userType;
        $("#displayFullname").text(`${data.firstName}  ${data.lastName}`)
        $("#displayUsername").text(`@${data.username}`)
        $("#joinedDate").text(`${new Date(data.createdAt).toDateString()}`)
        $("#joinedDateMob").text(`Joined: ${new Date(data.createdAt).toDateString()}`)
        $("#firstname").attr("value", `${data.firstName}`)
        $("#lastname").attr("value", `${data.lastName}`)
        $("#username").attr("value", `${data.username}`)
        $("#email").attr("value", `${data.email}`)
        $("#emailmobile").text(`${data.email}`)
        $("#yearsExperience").attr("value", `${data.yearsExperience}`)
        $("#sessionCost").attr("value", `${data.sessionCost}`)
        if (!data.phoneNum) {
            $("#phone").attr("value",)
            $("#phonemobile").text()
        } else {
            $("#phone").attr("value", data.phoneNum)
            $("#phonemobile").text(data.phoneNum)
        }
        // For therapist users, display the 2 additional fields
        if (data.userType == "therapist") {
            var displayTherapist = document.querySelectorAll(".therapistOptions");
            for (var i = 0; i < displayTherapist.length; i++) {
                displayTherapist[i].style.display = "flex";
            }
        }
    }
});

/**
 * Retrieving user's profile picture from database and linking the src to display image
 * Putting in timeout with a small margin delay is needed to shift the loading time 
 * so it wouldn't load everything at once.
 */
setTimeout(() => {
    $.ajax({
        url: '/getProfilePicture',
        type: 'GET',
        success: function (data) {
            $("#profileImage").attr('src', data.profileImg)
            $("#profileImageMob").attr('src', data.profileImg)
        }
    })
}, 50);

/**
 * Hide error messages by default.
 */
function hideErrorMessages() {
    document.getElementById("phoneErrorMessage").style.display = 'none';
    document.getElementById("emailErrorMessage").style.display = 'none';
    document.getElementById("usernameErrorMessage").style.display = 'none';
    document.getElementById("validationErrorMessage").style.display = 'none';
}

/**
 * 
 * Display input field errors on profile page depending on which field was invalid.
 * 
 * @param {*} data from form fields
 * @returns validated true if all fields are valid.
 */
function serverInputValidation(data) {
    let validated = false;
    if (data == "existingEmail") {
        hideErrorMessages();
        document.getElementById("emailErrorMessage").style.display = 'block';
        document.getElementById("emailErrorMessage").innerHTML = "A user with that email already exists";
    } else if (data == "existingPhone") {
        hideErrorMessages();
        document.getElementById("phoneErrorMessage").style.display = 'block';
        document.getElementById("phoneErrorMessage").innerHTML = "A user with that phone number already exists";
    } else if (data == "existingUsername") {
        hideErrorMessages();
        document.getElementById("usernameErrorMessage").style.display = 'block';
        document.getElementById("usernameErrorMessage").innerHTML = "A user with that username already exists";
    } else if (data == "passwordValidation") {
        hideErrorMessages();
        document.getElementById("validationErrorMessage").style.display = 'block';
        document.getElementById("validationErrorMessage").innerHTML = "Password must be at least 5 or less than 20 characters long";
    } else {
        validated = true
    }
    return validated;
}

/**
 * 
 * Display animation for when user clicks save changes.
 * 
 * @param {*} data from form fields
 */
function handleEditSuccess(data) {
    // If password is empty then simply refresh the page, 
    // if password is changed then log the user out back to login page
    if (data == "updated") {
        if (document.getElementById("password").value == "") {
            hideErrorMessages();
            document.getElementById('profileSuccessModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                window.location = '/userprofile'
            }, 2500);
        } else {
            $.post("/logout");
            hideErrorMessages()
            document.getElementById('profileSuccessModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                window.location = '/login'
            }, 2500);
        }
    } else if (data == "logout") {
        window.location = '/login'
    }
}

/**
 * Edit Profile AJAX call to format the field values when user enters valid fields and clicks save changes.
 */
function editProfile() {
    $.ajax({
        url: '/editProfile',
        type: 'POST',
        data: {
            firstname: $("#firstname").val().charAt(0).toUpperCase() + $("#firstname").val().substring(1),
            lastname: $("#lastname").val().charAt(0).toUpperCase() + $("#lastname").val().substring(1),
            email: $("#email").val().toLowerCase(),
            username: $("#username").val().toLowerCase(),
            phone: $("#phone").val(),
            password: $("#password").val(),
            yearsExperience: $("#yearsExperience").val(),
            sessionCost: $("#sessionCost").val(),
        },
        success: function (data) {
            if (serverInputValidation(data)) {
                handleEditSuccess(data);
            }
        }
    })
}

/**
 * Save changes on profile page.
 */
$('#saveChanges').click(() => {
    var phoneLength = $("#phone").val();
    if (phoneLength.length != 10) {
        hideErrorMessages();
        document.getElementById("phoneErrorMessage").style.display = 'block';
        document.getElementById("phoneErrorMessage").innerHTML = "Your phone number must be of length 10";
    } else if (!isEmail($("#email").val())) {
        hideErrorMessages();
        document.getElementById("emailErrorMessage").style.display = 'block';
        document.getElementById("emailErrorMessage").innerHTML = "Please follow this email pattern: example@email.com";
    } else if (inputValidation()) {
        window.scrollTo(0, document.body.scrollHeight);
        hideErrorMessages();
        document.getElementById("validationErrorMessage").style.display = 'block';
        document.getElementById("validationErrorMessage").innerHTML = "There are empty fields";
    } else if (negativeValidation()) {
        window.scrollTo(0, document.body.scrollHeight);
        hideErrorMessages();
        document.getElementById("validationErrorMessage").style.display = 'block';
        document.getElementById("validationErrorMessage").innerHTML = "Experience or cost of session cannot be less than 0";
    } else if ($("#password").val() != "" && passwordValidation()) {
        window.scrollTo(0, document.body.scrollHeight);
        hideErrorMessages();
        document.getElementById("validationErrorMessage").style.display = 'block';
        document.getElementById("validationErrorMessage").innerHTML = "Password must be at least 5 or less than 20 characters long";
    } else {
        // If all validation checks then call AJAX call to update the database for the new changes on profile page
        editProfile();
    }
});

/**
 * 
 * Email validation to ensure the email is formatted correctly.
 * 
 * @param {*} email input field value
 * @returns the formatted pattern value
 */
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

/**
 * 
 * Standard input validation to ensure not empty and formatted correctly.
 * 
 * @returns true if all form fields are validated
 */
function inputValidation() {
    const inpObjFirstName = document.getElementById("firstname");
    const inpObjLastName = document.getElementById("lastname");
    const inpObjUsername = document.getElementById("username");
    const inpObjExperience = document.getElementById("yearsExperience");
    const inpObjSession = document.getElementById("sessionCost");
    if (currentType == "therapist") {
        if (!inpObjFirstName.checkValidity() || !inpObjLastName.checkValidity() || !inpObjUsername.checkValidity() ||
            !inpObjExperience.checkValidity() || !inpObjSession.checkValidity()) {
            return true;
        }
    } else {
        if (!inpObjFirstName.checkValidity() || !inpObjLastName.checkValidity() || !inpObjUsername.checkValidity()) {
            return true;
        }
    }
}

/**
 * 
 * Password validation check.
 * 
 * @returns  true if password is validated
 */
function passwordValidation() {
    const inpObjPassword = document.getElementById("password");
    if (!inpObjPassword.checkValidity()) {
        return true;
    }
}

/**
 * 
 *  Negative validation check for therapist fields to restrict user from entering non-positive values.
 * 
 * @returns  true if therapist fields are validated with a positive value
 */
function negativeValidation() {
    const yearsExp = document.getElementById("yearsExperience").value;
    const cost = document.getElementById("sessionCost").value;
    if (yearsExp < 0 || cost < 0) {
        return true;
    }
}

/**
 * Trigger click function for enter key for all input fields.
 */
const input = document.querySelectorAll(".form-control");
for (var i = 0; i < input.length; i++) {
    input[i].addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("saveChanges").click();
        }
    });
}

/**
 * If its user profile page for desktop view then execute the following functions.
 */
if (window.location.pathname == '/userprofile') {

    // If delete account is clicked for desktop account page, then display the confirmation modal 
    document.getElementById('deleteAccount').onclick = function (e) {
        displayDeleteUserModal();

        // When user confirms the deletion for the account, display a message and redirect user back to login page
        document.getElementById('deleteAccountBtn').onclick = function () {
            document.getElementById("deleteAccountErrorMessage").style.display = 'none';
            ajaxDeleteUserAccunt();
        }
    }

    // If delete account is clicked for mobile account page, then display the confirmation modal
    document.getElementById('mobDeleteAccount').onclick = function (e) {
        displayDeleteUserModal();
    }

    // If cancel button is clicked, hide modal for Delete User
    document.getElementById("closeDelete").onclick = function () {
        hideDeleteUserModal();
    }

    // If user clicks outside of the modal for both Create and Delete then hide modal
    window.onclick = function (event) {
        if (event.target == deleteUserModal) {
            hideDeleteUserModal();
        }
    }
}

/**
 * Display the delete user modal
 */
function displayDeleteUserModal() {
    deleteUserModal.style.display = "block";
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the delete user modal
 */
function hideDeleteUserModal() {
    deleteUserModal.style.display = "none";
    document.body.style.overflow = 'auto';
}

/**
 * 
 * AJAX call to delete the user from the database and log the user out
 * 
 * @return empty if the last admin wants to delete their profile to prevent 0 admin errors
 */
function ajaxDeleteUserAccunt() {
    $.ajax({
        url: '/deleteUserProfile',
        type: 'DELETE',
        success: function (data) {
            // If user is the last admin, then display message to alert they are the last admin and cannot be deleted
            if (data == 'lastAdmin') {
                document.getElementById("deleteAccountErrorMessage").style.display = 'block';
                $('#deleteAccountErrorMessage').html('Deletion failed. Database needs to have at least 1 administrator.')
                return;
            } else {
                document.getElementById("deleteAccountErrorMessage").style.display = 'none';
                document.getElementById('profileSuccessModal').style.display = 'flex';
            }
            setTimeout(() => {
                window.location = '/login'
            }, 2500);
        }
    })
}

// --- Saved summaries UI & actions ---
const summariesModal = document.getElementById('summariesModal');
const summariesList = document.getElementById('summariesList');
const openSummariesBtn = document.getElementById('openSummaries');
const closeSummariesBtn = document.getElementById('closeSummaries');
const sendTestEmailBtn = document.getElementById('sendTestEmailBtn');

function renderSummaries(summaries) {
    summariesList.innerHTML = '';
    if (!summaries || summaries.length === 0) {
        summariesList.innerHTML = '<p>No saved summaries.</p>';
        return;
    }
    summaries.forEach(s => {
        const container = document.createElement('div');
        container.className = 'summaryItem';
        container.style.border = '1px solid #ddd';
        container.style.padding = '0.6rem';
        container.style.marginBottom = '0.6rem';

        const preview = document.createElement('div');
        preview.innerHTML = `<strong>Saved:</strong> ${new Date(s.createdAt).toLocaleString()} <small style="color:#666;">id: ${s._id}</small>`;

        const text = document.createElement('div');
        text.style.marginTop = '0.5rem';
        text.style.whiteSpace = 'pre-wrap';
        text.innerText = s.summary.length > 300 ? s.summary.slice(0,300) + '...' : s.summary;

        const actions = document.createElement('div');
        actions.style.marginTop = '0.6rem';

        // view
        const viewBtn = document.createElement('button'); viewBtn.textContent = 'View';
        viewBtn.onclick = () => {
            text.innerText = s.summary;
        }

        // regenerate
        const regenBtn = document.createElement('button'); regenBtn.textContent = 'Regenerate';
        regenBtn.style.marginLeft = '0.5rem';
        regenBtn.onclick = () => {
            regenBtn.disabled = true;
            $.post(`/summaries/${s._id}/regenerate`).done(function (data) {
                if (data && data.summary) {
                    s.summary = data.summary;
                    text.innerText = data.summary;
                }
            }).fail(function (xhr) {
                alert('Failed to regenerate: ' + (xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'unknown'));
            }).always(() => regenBtn.disabled = false);
        }

        // clean
        const cleanBtn = document.createElement('button'); cleanBtn.textContent = 'Clean';
        cleanBtn.style.marginLeft = '0.5rem';
        cleanBtn.onclick = () => {
            cleanBtn.disabled = true;
            $.post(`/summaries/${s._id}/clean`).done(function (data) {
                if (data && data.summary) {
                    s.summary = data.summary;
                    text.innerText = data.summary;
                }
            }).fail(function (xhr) {
                alert('Failed to clean: ' + (xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'unknown'));
            }).always(() => cleanBtn.disabled = false);
        }

        // resend
        const resendBtn = document.createElement('button'); resendBtn.textContent = 'Resend email';
        resendBtn.style.marginLeft = '0.5rem';
        resendBtn.onclick = () => {
            resendBtn.disabled = true;
            $.post(`/summaries/${s._id}/resend-email`).done(function (data) {
                if (data && data.status === 'sent') {
                    alert('Email sent');
                } else {
                    alert('Send failed: ' + (data.error || JSON.stringify(data)));
                }
            }).fail(function (xhr) {
                alert('Failed to resend: ' + (xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'unknown'));
            }).always(() => resendBtn.disabled = false);
        }

        // delete
        const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Delete';
        deleteBtn.style.marginLeft = '0.5rem';
        deleteBtn.onclick = () => {
            if (!confirm('Delete this saved summary?')) return;
            deleteBtn.disabled = true;
            $.ajax({ url: `/summaries/${s._id}`, method: 'DELETE' }).done(function (d) {
                container.remove();
            }).fail(function (xhr) {
                alert('Failed to delete: ' + (xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'unknown'));
                deleteBtn.disabled = false;
            });
        }

        actions.appendChild(viewBtn);
        actions.appendChild(regenBtn);
        actions.appendChild(cleanBtn);
        actions.appendChild(resendBtn);
        actions.appendChild(deleteBtn);

        container.appendChild(preview);
        container.appendChild(text);
        container.appendChild(actions);

        summariesList.appendChild(container);
    });
}

openSummariesBtn.onclick = function () {
    summariesModal.style.display = 'block';
    // fetch summaries
    summariesList.innerHTML = 'Loading...';
    $.get('/my-summaries').done(function (data) {
        renderSummaries(data);
    }).fail(function (xhr) {
        summariesList.innerHTML = '<p style="color:red;">Failed to load summaries.</p>';
    });
}

closeSummariesBtn.onclick = function () {
    summariesModal.style.display = 'none';
}

// send test email
sendTestEmailBtn.onclick = function () {
    sendTestEmailBtn.disabled = true;
    $.post('/send-test-email').done(function (data) {
        alert('Test email status: ' + JSON.stringify(data));
    }).fail(function (xhr) {
        alert('Failed to send test email: ' + (xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'unknown'));
    }).always(function () { sendTestEmailBtn.disabled = false; });
}