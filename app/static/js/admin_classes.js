class TableManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        $(document).ready(() => {
            $('#createTableForm').submit((e) => {
                e.preventDefault();
                this.createTable();
            });
        });
    }

    createTable() {
        var tableNumber = $('#tableNumber').val();
        $.ajax({
            type: 'POST',
            url: '/create_table',
            contentType: 'application/json',
            data: JSON.stringify({ tableNumber: tableNumber }),
            success: (response) => {
                this.updateTables(response.tables);
                $('#createTableModal').modal('hide');
                location.reload();
            },
            error: (xhr) => {
                var errorMessage = xhr.responseJSON.message;
                alert(errorMessage);
            }
        });
    }

    deleteTable(tableId) {
        if (confirm("Are you sure you want to delete this table?")) {
            $.ajax({
                type: 'POST',
                url: '/delete_table',
                contentType: 'application/json',
                data: JSON.stringify({ tableId: tableId }),
                success: (response) => {
                    alert(response.message);
                    location.reload();
                },
                error: (xhr) => {
                    var errorMessage = xhr.responseJSON.message;
                    alert(errorMessage);
                }
            });
        }
    }

    updateTables(tables) {
        var tablesContainer = $('#tables');
        tablesContainer.empty();
        tables.forEach((table) => {
            var tableCircle = $('<div class="tables"></div>');
            tableCircle.text('Table ' + table.table_number);
            tableCircle.attr('onclick', 'guestManager.viewGuests(' + table.id + ')');
            tablesContainer.append(tableCircle);
        });
    }
}


class GuestManager {
    constructor() {
        $(document).ready(() => {
            $('#guestRegistrationForm').submit((e) => {
                e.preventDefault();
                this.submitGuestRegistration();
            });

            $('#coupleRegistrationForm').submit((e) => {
                e.preventDefault();
                this.submitCoupleRegistration();
            });
        });
    }

    viewGuests(tableId) {
        $.ajax({
            url: '/guests/' + tableId,
            type: 'GET',
            success: (response) => {
                $('#guestsModalBody').html(response);
                $('#guestsModal').modal('show');
            },
            error: (xhr, status, error) => {
                alert('An error occurred while fetching the guest data.');
            }
        });
    }

    openGuestRegistrationModal(tableId) {
        document.getElementById('table_number').value = tableId;
        document.getElementById('registerModal').style.display = 'block';
    }

    openCoupleRegistrationModal(tableId) {
        document.getElementById('couple_table_number').value = tableId;
        document.getElementById('coupleRegistrationModal').style.display = 'block';
    }

    submitGuestRegistration() {
        const formData = {
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            guest_id: document.getElementById('guest_id').value,
            table_number: document.getElementById('table_number').value
        };

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/register_guest', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.closeModal();
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

    submitCoupleRegistration() {
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
            success: () => {
                this.closeModal();
                alert('Couple registered successfully!');
                window.location.href = '/dashboard';
            },
            error: () => {
                alert('An error occurred. Please try again.');
            }
        });
    }

    closeModal() {
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('coupleRegistrationModal').style.display = 'none';
    }
}

const guestManager = new GuestManager();
const tableManager = new TableManager();
