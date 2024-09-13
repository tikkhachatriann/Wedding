$('#createTableForm').submit(function(e) {
    e.preventDefault();
    var tableNumber = $('#tableNumber').val();
    $.ajax({
        type: 'POST',
        url: '/create_table',
        contentType: 'application/json',
        data: JSON.stringify({ tableNumber: tableNumber }),
        success: function(response) {
            updateTables(response.tables);
            $('#createTableModal').modal('hide');
            location.reload();
        },
        error: function(xhr, status, error) {
            var errorMessage = xhr.responseJSON.message;
            alert(errorMessage);
        }
    });
});


function deleteTable(tableId) {
    if (confirm("Are you sure you want to delete this table?")) {
        $.ajax({
            type: 'POST',
            url: '/delete_table',
            contentType: 'application/json',
            data: JSON.stringify({ tableId: tableId }),
            success: function(response) {
                alert(response.message);
                location.reload();
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.responseJSON.message;
                alert(errorMessage);
            }
        });
    }
}

function updateTables(tables) {
    var tablesContainer = $('#tables');
    tablesContainer.empty();
    tables.forEach(function(table) {
        var tableCircle = $('<div class="tables"></div>');
        tableCircle.text('Table ' + table.table_number);
        tableCircle.attr('onclick', 'viewGuests(' + table.id + ')');
        tablesContainer.append(tableCircle);
    });
}

function resetTableGuests(tableId) {
    if (confirm("Are you sure you want to reset all guests for this table?")) {
        $.ajax({
            type: 'POST',
            url: '/reset_table_guests',
            contentType: 'application/json',
            data: JSON.stringify({ tableId: tableId }),
            success: (response) => {
                alert(response.message);
                location.reload();
            },
            error: (xhr, status, error) => {
                const errorMessage = xhr.responseJSON.message;
                alert(errorMessage);
            }
        });
    }
}


function showUsersModal() {
    $('#usersModal').modal('show');
}

function viewGuests(tableId) {
    $.ajax({
        url: '/guests/' + tableId,
        type: 'GET',
        success: function(response) {
            $('#guestsModalBody').html(response);
            $('#guestsModal').modal('show');
        },
        error: function(xhr, status, error) {
            alert('An error occurred while fetching the guest data.');
        }
    });
}

function registerGuest() {
    document.getElementById('registerModal').style.display = 'block';
}

function openGuestRegistrationModal(tableId) {
    document.getElementById('table_number').value = tableId; 
    document.getElementById('registerModal').style.display = 'block';
}

function openCoupleRegistrationModal(tableId) {
    document.getElementById('couple_table_number').value = tableId;
    document.getElementById('coupleRegistrationModal').style.display = 'block';
}


function submitCoupleRegistration() {
    const formData = {
        name1: document.getElementById('name1').value,
        surname1: document.getElementById('surname1').value,
        name2: document.getElementById('name2').value,
        surname2: document.getElementById('surname2').value,
        guest_id: document.getElementById('couple_guest_id').value,
        table_number: document.getElementById('couple_table_number').value
    };

    $.ajax({
        type: 'POST',
        url: '/register_guest',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function() {
            closeModal();
            alert('Couple registered successfully!');
            window.location.href = '/dashboard';
        },
        error: function() {
            alert('An error occurred. Please try again.');
        }
    });
}

function submitGuestRegistration() {
    const formData = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        guest_id: document.getElementById('guest_id').value,
        table_number: document.getElementById('table_number').value
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/register_guest', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            closeModal();
            alert('Guest registered successfully!');
            window.location.href = '/dashboard';
        } else if (xhr.readyState === 4) {
            alert('An error occurred. Please try again.');
        }
    };

    const encodedData = Object.keys(formData)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]))
        .join('&');

    xhr.send(encodedData);
}


window.onclick = function(event) {
    if ($(event.target).hasClass('modal')) {
        $(event.target).hide();
    }
}

function closeModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('coupleRegistrationModal').style.display = 'none';
}