$(document).ready(async function () {

    /**
     * retreiving all users data and display it in the admin panel.
     */
    await $.ajax({
        url: '/getAllUsersData',
        type: "GET",
        success: function (data) {
            data.forEach(userData => {
                var x = `<tr class="tableRows" id="${userData._id}">`;
                x += `<td>${userData.firstName}</td>`;
                x += `<td>${userData.lastName}</td>`
                x += `<td>${userData.username}</td>`
                x += `<td>${userData.email}</td>`
                x += `<td>${userData.phoneNum}</td>`
                x += `<td>${userData.userType.charAt(0).toUpperCase() + userData.userType.substring(1)}</td>`
                x += `<td class="hiddenRow">${userData.yearsExperience}</td>`
                x += `<td class="hiddenRow">${userData.sessionCost}</td>`
                x += `<td>`
                x += `<div class="dashSettings inactive">`
                x += `<i class="bi bi-gear-fill"></i>`
                x += `<i class="bi bi-pencil-fill settingIcon editUser"></i>`
                x += `<i class="bi bi-trash-fill settingIcon deleteUser"></i>`
                x += `</div>`
                x += `</td>`
                x += `</tr>`
                $("tbody").append(x);
            });
            document.getElementById("resultsFound").innerHTML = data.length
        }
    });

    
    document.getElementById('0').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('1').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('2').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('3').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('4').setAttribute("class", "bi bi-caret-down-fill");

    
    sortTable();

    
    var createUserModal = document.getElementById("createUserModal");
    var editUserModal = document.getElementById("editUserModal");
    var deleteUserModal = document.getElementById("deleteUserModal");


    /**
     * 
     * Display input field errors on profile page depending on which field was invalid.
     * 
     * @returns validated true if all fields are valid.
     */
    function createInputValidation() {
        let validated = false;
        var phoneLength = $("#phone").val();
        if (phoneLength.length != 10) {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "The phone number must be of length 10";
        } else if (!isEmail($("#email").val())) {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "Please follow this email pattern: example@email.com";
        } else if (inputValidationCreate()) {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "There are empty fields";
        } else if (passwordValidationCreate()) {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "Password must be at least 5 or less than 20 characters long";
        } else if (negativeValidationcreate()) {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "Experience or cost of session cannot be less than 0";
        } else {
            validated = true
        }
        return validated;
    }

    /**
     * 
     * Display input field errors on profile page depending on which field was invalid.
     * 
     * @param {*} data from form fields
     * @returns validated true if all fields are valid.
     */
    function handleCreateResponse(data) {
        if (data == "existingEmail") {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "A user with that email already exists";
        } else if (data == "existingPhone") {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "A user with that phone number already exists";
        } else if (data == "existingUsername") {
            document.getElementById("createUserErrorMessage").style.display = 'block';
            document.getElementById("createUserErrorMessage").innerHTML = "A user with that username already exists";
        } else {
            document.getElementById('dashboardSuccessModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                location.reload();
            }, 2500);
        }

    }

    
    document.getElementById('createUser').onclick = function () {
        createUserModal.style.display = "block";
        document.body.style.overflow = 'hidden';
        showTherapyOptions($("#userType"));
        $('#createUserBtn').off();
        $('#createUserBtn').click(() => {
            if (createInputValidation()) {
                
                $.ajax({
                    url: '/createUser',
                    type: 'POST',
                    data: {
                        firstname: $("#firstname").val().charAt(0).toUpperCase() + $("#firstname").val().substring(1),
                        lastname: $("#lastname").val().charAt(0).toUpperCase() + $("#lastname").val().substring(1),
                        username: $("#username").val().toLowerCase(),
                        phone: $("#phone").val(),
                        email: $("#email").val().toLowerCase(),
                        userType: $("#userType").val(),
                        yearsExperience: $("#yearsExperience").val(),
                        sessionCost: $("#sessionCost").val(),
                        password: $("#password").val(),
                    },
                    success: handleCreateResponse
                })
            }
        });
    }

    /**
     * 
     * This function checks to see if the inputted values for the form fields
     * are valid.
     * 
     * @returns true if there are validation errors
     */
    function inputValidationCreate() {
        const inpObjFirstName = document.getElementById("firstname");
        const inpObjLastName = document.getElementById("lastname");
        const inpObjUsername = document.getElementById("username");
        const inpObjExperience = document.getElementById("yearsExperience");
        const inpObjSession = document.getElementById("sessionCost");
        if (!inpObjFirstName.checkValidity() || !inpObjLastName.checkValidity() || !inpObjUsername.checkValidity()) {
            return true;
        } else if ($("#userType").val() == 'therapist' && (!inpObjExperience.checkValidity() || !inpObjSession.checkValidity())) {
            return true;
        }
    }

    /**
     * 
     * This function checks to see if the inputted value for password field
     * is valid.
     * 
     * @returns true if password is invalid
     */
    function passwordValidationCreate() {
        const inpObjPassword = document.getElementById("password");
        if (!inpObjPassword.checkValidity()) {
            return true;
        }
    }

    /**
     * 
     * This function checks to see if the inputted values for sessionCost
     * and yearsExperience fieldsa are valid.
     * 
     * @returns 
     */
    function negativeValidationcreate() {
        const yearsExp = document.getElementById("yearsExperience").value;
        const cost = document.getElementById("sessionCost").value;
        if (yearsExp < 0 || cost < 0) {
            return true;
        }
    }

    /**
     * 
     * This function checks to see if the to be deleted user is the last
     * administrator in the database.
     * 
     * @param {*} data 
     * @returns 
     */
    function handleDeleteResponse(data) {
        if (data == 'lastAdmin') {
            document.getElementById("deleteUserErrorMessage").style.display = 'block';
            $('#deleteUserErrorMessage').html('Deletion failed. Database needs to have at least 1 administrator.')
            return;
        } else {
            document.getElementById("deleteUserErrorMessage").style.display = 'none';
            document.getElementById('dashboardSuccessModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        setTimeout(() => {
            location.reload();
        }, 2500);
    }

    
    const deleteUserBtns = document.querySelectorAll('.deleteUser');

    
    for (var i = 0; i < deleteUserBtns.length; i++) {
        deleteUserBtns[i].onclick = function (e) {
            deleteUserModal.style.display = "block";
            document.body.style.overflow = 'hidden';
            document.getElementById("deleteUserErrorMessage").style.display = 'none';

            const currentRow = this.closest('tr');

            document.getElementById('deleteUsername').innerHTML = "@" + this.closest('tr').children[2].innerHTML;
            let userType = currentRow.children[5].innerHTML.toLowerCase();
            document.getElementById('deleteUserBtn').onclick = function () {
                $.ajax({
                    url: '/deleteUser',
                    type: 'DELETE',
                    data: {
                        id: currentRow.id,
                        previousUserType: userType
                    },
                    success: handleDeleteResponse
                })
            }
        }
    }

    /**
     * 
     * This function checks inputted values for form fields to make sure
     * they are valid.
     * 
     * @returns true if there are validation errors
     */
    function editInputValidation() {
        let validated = false;
        var phoneLength = $("#editPhone").val();
        if (phoneLength.length != 10) {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            document.getElementById("editUserErrorMessage").innerHTML = "The phone number must be of length 10";
        } else if (!isEmail($("#editEmail").val())) {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            document.getElementById("editUserErrorMessage").innerHTML = "Please follow this email pattern: example@gmail.com";
        } else if (inputValidationEdit()) {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            document.getElementById("editUserErrorMessage").innerHTML = "There are empty fields.";
        } else if (passwordValidationEdit()) {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            document.getElementById("editUserErrorMessage").innerHTML = "Password must be at least 5 or less than 20 characters long";
        } else if (negativeValidationEdit()) {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            document.getElementById("editUserErrorMessage").innerHTML = "Experience or cost of session cannot be less than 0";
        } else {
            validated = true
        }
        return validated;
    }

    /**
     * 
     * This helper function checks inputted values for form fields to make sure
     * they are valid.
     * 
     * @param {*} data as form field
     */
    function handleEditResponse(data) {
        if (data == "existingEmail") {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            $("#editUserErrorMessage").html("A user with that email already exists");
        } else if (data == "existingPhone") {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            $("#editUserErrorMessage").html("A user with that phone number already exists");
        } else if (data == "existingUsername") {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            $("#editUserErrorMessage").html("A user with that username already exists");
        } else if (data == "updatedWithPassword") {
            document.getElementById("editUserErrorMessage").style.display = 'none';
            document.getElementById('dashboardSuccessModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                location.reload();
            }, 2500);
        } else if (data == 'lastAdmin') {
            document.getElementById("editUserErrorMessage").style.display = 'block';
            $("#editUserErrorMessage").html("Edit failed. Database needs to have at least 1 administrator.");
        } else {
            document.getElementById("editUserErrorMessage").style.display = 'none';
            document.getElementById('dashboardSuccessModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                location.reload();
            }, 2500);
        }
    }

    /**
     * 
     * This helper function fetches and display each row (users) information
     * from the database and displays them on the admin panel's edit user form.
     * 
     * @param {*} currentRow as the form field 
     */
    function setupEditModal(currentRow) {
        document.getElementById("editUserErrorMessage").style.display = 'none';
        document.getElementById('editFirstname').value = currentRow.children[0].innerHTML;
        document.getElementById('editLastname').value = currentRow.children[1].innerHTML;
        document.getElementById('editUsername').value = currentRow.children[2].innerHTML;
        document.getElementById('editEmail').value = currentRow.children[3].innerHTML;
        document.getElementById('editPhone').value = currentRow.children[4].innerHTML;
        document.getElementById("editUserType").value = currentRow.children[5].innerHTML.toLowerCase();
        document.getElementById('editYearsExperience').value = currentRow.children[6].innerHTML;
        document.getElementById("editSessionCost").value = currentRow.children[7].innerHTML.toLowerCase();
        document.getElementById("editPassword").value = "";
        showTherapyOptions($("#editUserType"));
    }

    
    const editUserBtns = document.querySelectorAll('.editUser');

    
    for (var i = 0; i < editUserBtns.length; i++) {
        editUserBtns[i].onclick = function (e) {
            editUserModal.style.display = "block";
            document.body.style.overflow = 'hidden';
            const currentRow = this.closest('tr');
            let previousUserType = currentRow.children[5].innerHTML.toLowerCase();
            setupEditModal(currentRow);
            $('#editUserBtn').off();
            $('#editUserBtn').click(() => {
                if (editInputValidation()) {
                    
                    $.ajax({
                        url: '/editUser',
                        type: 'PUT',
                        data: {
                            id: currentRow.id,
                            previousUserType: previousUserType,
                            firstname: $("#editFirstname").val().charAt(0).toUpperCase() + $("#editFirstname").val().substring(1),
                            lastname: $("#editLastname").val().charAt(0).toUpperCase() + $("#editLastname").val().substring(1),
                            username: $("#editUsername").val().toLowerCase(),
                            email: $("#editEmail").val().toLowerCase(),
                            phone: $("#editPhone").val(),
                            userType: $("#editUserType").val(),
                            yearsExperience: $("#editYearsExperience").val(),
                            sessionCost: $("#editSessionCost").val(),
                            password: $("#editPassword").val()
                        },
                        success: handleEditResponse
                    })
                }
            });
        }
    }

    /**
     * 
     * This helper function checks the inputted valies from the form fields
     * to make sure they are valid.
     * 
     * @returns true if the inputs are invalid
     */
    function inputValidationEdit() {
        var currentType = document.getElementById("editUserType").value
        const inpObjFirstName = document.getElementById("editFirstname");
        const inpObjLastName = document.getElementById("editLastname");
        const inpObjUsername = document.getElementById("editUsername");
        const inpObjExperience = document.getElementById("editYearsExperience");
        const inpObjSession = document.getElementById("editSessionCost");
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
     * This helper function checks to see if the inputted value for the
     * password field is valid.
     * 
     * @returns true if the input is invalid
     */
    function passwordValidationEdit() {
        const inpObjPassword = document.getElementById("editPassword");
        if (!inpObjPassword.checkValidity()) {
            return true;
        }
    }

    /**
     * 
     * This helper function checks to see if the inputted values for
     * sessionCost and yearsExperience are valid.
     * 
     * @returns true if the inputs are invalid.
     */
    function negativeValidationEdit() {
        const yearsExp = document.getElementById("editYearsExperience").value;
        const cost = document.getElementById("editSessionCost").value;
        if (yearsExp < 0 || cost < 0) {
            return true;
        }
    }

    
    document.getElementById("closeCreate").onclick = function () {
        createUserModal.style.display = "none";
        document.body.style.overflow = 'auto';
    }

    document.getElementById("closeEdit").onclick = function () {
        editUserModal.style.display = "none";
        document.body.style.overflow = 'auto';
    }

    
    document.getElementById("closeDelete").onclick = function () {
        deleteUserModal.style.display = "none";
        document.body.style.overflow = 'auto';
    }

    /**
     * 
     * If user clicks outside of the modal for both Create, Edit and Delete then hide modal.
     * 
     * @param {*} event as an eventlistened for what the user clicks
     */
    window.onclick = function (event) {
        if (event.target == createUserModal) {
            document.getElementById("createUserErrorMessage").style.display = 'none';
            createUserModal.style.display = "none";
            document.body.style.overflow = 'auto';
        } else if (event.target == editUserModal) {
            document.getElementById("editUserErrorMessage").style.display = 'none';
            editUserModal.style.display = "none";
            document.body.style.overflow = 'auto';
        } else if (event.target == deleteUserModal) {
            document.getElementById("deleteUserErrorMessage").style.display = 'none';
            deleteUserModal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    }

    
    const dashSet = document.querySelectorAll('.dashSettings');
    for (const set of dashSet) {
        set.onclick = function () {
            if (this.classList.contains('active') || this.classList.contains('inactive')) {

                this.firstElementChild.classList.toggle('active');
                if (this.children[1].classList.contains('active') ||
                    this.children[1].classList.contains('inactive') ||
                    this.children[2].classList.contains('active') ||
                    this.children[2].classList.contains('inactive')) {
                    this.children[1].classList.toggle('active');
                    this.children[1].classList.toggle('inactive');
                    this.children[2].classList.toggle('active');
                    this.children[2].classList.toggle('inactive');
                } else {
                    this.children[1].classList.add('active');
                    this.children[2].classList.add('active');
                }
            }
        };
    }
});


function searchTable() {
    const searchInput = document.getElementById("searchbar").value.toUpperCase();
    const table = document.getElementById("dashboardTable");
    const trs = table.tBodies[0].getElementsByTagName("tr");
    let count = 0;

    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].getElementsByTagName("td");
        trs[i].style.display = "none";

        for (var j = 0; j < tds.length; j++) {
            if (tds[j].innerHTML.toUpperCase().indexOf(searchInput) > -1) {
                trs[i].style.display = "";
                count++;
                break;
            }
        }
    }
    $("#resultsFound").html(`${count}`);
}


function sortTable() {
    const table = document.getElementById('dashboardTable');
    const headers = table.querySelectorAll('.tHead');
    const directions = Array.from(headers).map(function (header) {
        return '';
    });

    const transform = function (index, content) {
        const type = headers[index].getAttribute('data-type');
        switch (type) {
            case 'number':
                return parseFloat(content);
            case 'string':
            default:
                return content;
        }
    };

    const tableBody = table.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');

    const sortColumn = function (index) {
        const direction = directions[index] || 'asc';
        const multiplier = direction === 'asc' ? 1 : -1;
        const newRows = Array.from(rows);

        newRows.sort(function (rowA, rowB) {
            const cellA = rowA.querySelectorAll('td')[index].innerHTML.toLowerCase();
            const cellB = rowB.querySelectorAll('td')[index].innerHTML.toLowerCase();

            const a = transform(index, cellA);
            const b = transform(index, cellB);

            switch (true) {
                case a > b:
                    return 1 * multiplier;
                case a < b:
                    return -1 * multiplier;
                case a === b:
                    return 0;
            }
        });

        [].forEach.call(rows, function (row) {
            tableBody.removeChild(row);
        });

        if (direction === 'asc') {
            directions[index] = 'desc';
            document.getElementById(index).setAttribute("class", "bi bi-caret-down-fill");

        } else {
            directions[index] = 'asc';
            document.getElementById(index).setAttribute("class", "bi bi-caret-up-fill");
        }

        newRows.forEach(function (newRow) {
            tableBody.appendChild(newRow);
        });
    };

    [].forEach.call(headers, function (header, index) {
        header.addEventListener('click', function () {
            sortColumn(index);
            for (var i = 0; i < headers.length; i++) {
                if (i == index) {
                    if (directions[index] === 'asc') {
                        document.getElementById(i).parentElement.style.color = '#000';
                    } else {
                        document.getElementById(i).parentElement.style.color = '#09C5A3';
                    }
                } else {
                    document.getElementById(i).parentElement.style.color = '#000';
                }
            }
        });
    });
}

/**
 * 
 * Display therapy field options if usertype is a therapist.
 * 
 * @param {*} selectObject as form field
 */
function showTherapyOptions(selectObject) {
    const value = $(selectObject).val();
    const therapyFieldOptions = document.querySelectorAll('.therapistOptions');
    if (value == 'therapist') {
        for (var i = 0; i < therapyFieldOptions.length; i++) {
            therapyFieldOptions[i].style.display = 'flex';
        }
    } else {
        for (var i = 0; i < therapyFieldOptions.length; i++) {
            therapyFieldOptions[i].style.display = 'none';
        }
    }
}

/**
 * 
 * This function checks to see if the given email matches the pattern.
 * 
 * @param {*} email as form field
 * @returns true if it matches the pattern, else false
 */
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}


const inputCreate = document.querySelectorAll("#createUserForm .form-control");
for (var i = 0; i < inputCreate.length; i++) {
    inputCreate[i].addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("createUserBtn").click();
        }
    });
}


const inputEdit = document.querySelectorAll("#editUserForm .form-control");
for (var i = 0; i < inputEdit.length; i++) {
    inputEdit[i].addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("editUserBtn").click();
        }
    });
}