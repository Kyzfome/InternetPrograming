(function() {
    'use strict';

    var CONTACTS_KEY = 'gustese_contacts';
    var CONTACT_AUTOCOMPLETE = ['Адреса', 'Телефон', 'Години', 'Email', 'Сайт'];
    var DEFAULT_DATA = [
        ['Адреса', 'вул. Хлібна, 5, м. Київ'],
        ['Телефон', '+38 (044) 123-45-67'],
        ['Години', 'Пн–Нд 7:00 – 20:00']
    ];

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('gustese_user'));
        } catch (e) {
            return null;
        }
    }

    function getStoredContacts() {
        try {
            var saved = localStorage.getItem(CONTACTS_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    function saveContactsToStorage(dt) {
        if (!dt || !dt.rows) return;
        var rows = [];
        dt.rows().every(function() {
            var d = this.data();
            if (d && d.length >= 2) {
                rows.push([d[0], d[1]]);
            }
        });
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(rows));
    }

    function validateContact(contactType, value) {
        var errors = [];
        if (!value || value.trim() === '') {
            errors.push('Поле "Дані" не може бути порожнім');
        }
        if (!contactType || contactType.trim() === '') {
            errors.push('Поле "Контакт" не може бути порожнім');
        }
        if (contactType === 'Телефон' && value) {
            var phoneRe = /^[\d\s\+\-\(\)]{10,20}$/;
            if (!phoneRe.test(value.replace(/\s/g, ''))) {
                errors.push('Невірний формат телефону (напр. +38 (044) 123-45-67)');
            }
        }
        if (contactType === 'Email' && value) {
            var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(value)) {
                errors.push('Невірний формат email');
            }
        }
        return errors;
    }

    function renderActions(dt) {
        var user = getCurrentUser();
        var actions = document.getElementById('contactActions');
        if (actions) {
            actions.style.display = user ? 'block' : 'none';
        }
        $('#contactTable tbody tr').each(function() {
            var row = $(this);
            var actionsCell = row.find('td:eq(2)');
            if (user) {
                actionsCell.html('<button type="button" class="btn-edit">Редагувати</button><button type="button" class="btn-delete">Видалити</button>');
            } else {
                actionsCell.empty();
            }
        });
    }

    function initDataTable() {
        var data = getStoredContacts() || DEFAULT_DATA;
        var tbody = document.querySelector('#contactTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            data.forEach(function(row) {
                var tr = document.createElement('tr');
                tr.innerHTML = '<td>' + (row[0] || '') + '</td><td>' + (row[1] || '') + '</td><td></td>';
                tbody.appendChild(tr);
            });
        }

        var dt = $('#contactTable').DataTable({
            language: {
                search: 'Пошук:',
                lengthMenu: 'Показати _MENU_ записів',
                info: 'Записи _START_ - _END_ з _TOTAL_',
                infoEmpty: 'Немає записів',
                zeroRecords: 'Нічого не знайдено',
                paginate: { first: '«', last: '»', next: '›', previous: '‹' }
            },
            pageLength: 5,
            columnDefs: [
                { orderable: false, targets: 2 }
            ]
        });

        renderActions(dt);

        $(document).on('click', '.btn-edit', function() {
            if (!getCurrentUser()) return;
            var row = $(this).closest('tr');
            var rowNode = row[0];
            var dt = $('#contactTable').DataTable();
            var rowData = dt.row(rowNode).data();
            var contactVal = rowData[0];
            var dataVal = rowData[1];

            row.find('td:eq(0)').html('<input type="text" list="contactTypes" value="' + contactVal + '" class="edit-input">');
            row.find('td:eq(1)').html('<input type="text" value="' + dataVal + '" class="edit-input">');
            row.find('td:eq(2)').html('<button type="button" class="btn-save">Зберегти</button><button type="button" class="btn-cancel">Скасувати</button>');
        });

        $(document).on('click', '.btn-cancel', function() {
            var dt = $('#contactTable').DataTable();
            dt.draw(false);
            renderActions(dt);
        });

        $(document).on('click', '.btn-save', function() {
            var row = $(this).closest('tr');
            var contactInput = row.find('td:eq(0) input');
            var dataInput = row.find('td:eq(1) input');
            var contactVal = contactInput.val().trim();
            var dataVal = dataInput.val().trim();

            var errors = validateContact(contactVal, dataVal);
            if (errors.length > 0) {
                alert(errors.join('\n'));
                return;
            }

            var dt = $('#contactTable').DataTable();
            dt.row(row[0]).data([contactVal, dataVal, '']).draw(false);
            saveContactsToStorage(dt);
            renderActions(dt);
        });

        $(document).on('click', '.btn-delete', function() {
            if (!confirm('Видалити запис?')) return;
            var row = $(this).closest('tr');
            var dt = $('#contactTable').DataTable();
            dt.row(row[0]).remove().draw();
            saveContactsToStorage(dt);
            renderActions(dt);
        });

        window.addEventListener('auth:logout', function() {
            renderActions(dt);
        });

        return dt;
    }

    function initAddRow(dt) {
        document.getElementById('btnAddRow').addEventListener('click', function() {
            if (!getCurrentUser()) return;
            var newRow = dt.row.add(['', '', '']).draw(false).node();
            $(newRow).find('td:eq(0)').html('<input type="text" list="contactTypes" placeholder="Контакт" class="edit-input">');
            $(newRow).find('td:eq(1)').html('<input type="text" placeholder="Дані" class="edit-input">');
            $(newRow).find('td:eq(2)').html('<button type="button" class="btn-save">Зберегти</button><button type="button" class="btn-delete">Видалити</button>');
            saveContactsToStorage(dt);
        });
    }

    function initAutocomplete() {
        document.querySelectorAll('input[list="contactTypes"]').forEach(function(inp) {
            inp.addEventListener('input', function() {
                var val = this.value.toLowerCase();
                var list = document.getElementById('contactTypes');
                var opts = list.getElementsByTagName('option');
                for (var i = 0; i < opts.length; i++) {
                    if (opts[i].value.toLowerCase().indexOf(val) === 0) {
                        return;
                    }
                }
            });
        });
        $(document).on('focus', 'input[list="contactTypes"]', function() {
            this.setAttribute('list', 'contactTypes');
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        var dt = initDataTable();
        initAddRow(dt);
        initAutocomplete();
    });
})();
