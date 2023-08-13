$(function () {
    var l, t, e = $(".datatable-doctor-upcoming-appointment-list")
    var r = (e.length && (l = e.DataTable({
        ajax: {
            url: '/doctor/appointment/doctor-upcoming-appointment-list',
            type: 'POST',
            dataSrc: ''
        },
        columns: [
            {
                data: ""
            },
            {
                data: "appointment_id"
            },
            {
                data: "patient.full_name"
            },
            {
                data: "patient.gender"
            },
            {
                data: "patient.appointment_date"
            },
            {
                data: "patient.appointment_time"
            },
            {
                data: "prescription_id"
            },
            {
                data: "status"
            },
            {
                data: "patient.email"
            },
            {
                data: "patient.user_enter_number"
            },
            {
                data: "patient.price"
            },
            {
                data: "doctor.user_id"
            },

        ],
        columnDefs: [
            {
                className: "control",
                orderable: false,
                searchable: false,
                responsivePriority: 2,
                targets: 0,
                render: function () {
                    return "";
                }
            },
            {
                targets: 1,
                orderable: false,
                searchable: false,
                responsivePriority: 3,
                checkboxes: true,
                checkboxes: {
                    selectAllRender: '<input type="checkbox" class="form-check-input">'
                },
                render: function () {
                    return '<input type="checkbox" class="dt-checkboxes form-check-input">';
                }
            },
            {
                targets: 2,
                visible: false
            },
            {
                targets: 6,
                visible: false
            },
            {
                targets: 3,
                responsivePriority: 1,
                render: function (data, type, row, meta) {
                    var n = undefined,
                        l = row.patient.full_name,
                        r = row.patient.gender;
                    return '<div class="d-flex justify-content-start align-items-center user-name"><div class="avatar-wrapper"><div class="avatar me-2">' + (n ? '<img src="' + n + '" alt="Avatar" class="rounded-circle">' : '<span class="avatar-initial rounded-circle bg-label-' + ["success", "danger", "warning", "info", "dark", "primary", "secondary"][Math.floor(6 * Math.random())] + '">' + (n = (((n = (l).match(/\b\w/g) || []).shift() || "") + (n.pop() || "")).toUpperCase()) + "</span>") + '</div></div><div class="d-flex flex-column"><span class="emp_name text-truncate">' + l + '</span><small class="emp_post text-truncate text-muted">' + r + "</small></div></div>"
                }
            },
            {
                targets: 7,
                render: function (data, type, row, meta) {
                    var status = row.status;
                    var statusMapping = {
                        COMPLETED: { title: "COMPLETE", class: "bg-label-primary" },
                        RECEIVED: { title: "RECEIVED", class: "bg-label-danger" },
                    };
                    return statusMapping[status] ? `<span class="badge ${statusMapping[status].class}">${statusMapping[status].title}</span>` : data;
                }
            },
            {
                targets: 10,
                responsivePriority: 1
            },
            {
                targets: 11,
                orderable: false,
                searchable: false,
                title: "Write Prescription",
                render: function (data, type, row, meta) {
                    return `
                        <a href="javascript:;" class="btn btn-sm btn-icon item-edit">
                            <i class="bx bxs-edit"></i>
                        </a>`;
                }
            },
            {
                targets: 12,
                orderable: false,
                searchable: false,
                title: "Prescription Document",
                render: function (data, type, row, meta) {
                    return `
                        <a href="javascript:;" class="btn btn-sm btn-icon send-btn">
                            <i class="bx bxs-send"></i>
                        </a>`;
                }
            }
        ],
        order: [
            [2, "desc"]
        ],
        dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
        displayLength: 7,
        lengthMenu: [7, 10, 25, 50, 75, 100],
        buttons: [{
            extend: "collection",
            className: "btn btn-label-primary dropdown-toggle me-2",
            text: '<i class="bx bx-export me-sm-1"></i> <span class="d-none d-sm-inline-block">Export</span>',
            buttons: [{
                extend: "print",
                text: '<i class="bx bx-printer me-1" ></i>Print',
                className: "dropdown-item",
                exportOptions: {
                    columns: [3, 4, 5, 6, 7],
                    format: {
                        body: function (e, t, a) {
                            var s;
                            return e.length <= 0 ? e : (e = $.parseHTML(e), s = "", $.each(e, function (e, t) {
                                void 0 !== t.classList && t.classList.contains("user-name") ? s += t.lastChild.firstChild.textContent : void 0 === t.innerText ? s += t.textContent : s += t.innerText
                            }), s)
                        }
                    }
                },
                customize: function (e) {
                    $(e.document.body).css("color", config.colors.headingColor).css("border-color", config.colors.borderColor).css("background-color", config.colors.bodyBg), $(e.document.body).find("table").addClass("compact").css("color", "inherit").css("border-color", "inherit").css("background-color", "inherit")
                }
            }, {
                extend: "csv",
                text: '<i class="bx bx-file me-1" ></i>Csv',
                className: "dropdown-item",
                exportOptions: {
                    columns: [3, 4, 5, 6, 7],
                    format: {
                        body: function (e, t, a) {
                            var s;
                            return e.length <= 0 ? e : (e = $.parseHTML(e), s = "", $.each(e, function (e, t) {
                                void 0 !== t.classList && t.classList.contains("user-name") ? s += t.lastChild.firstChild.textContent : void 0 === t.innerText ? s += t.textContent : s += t.innerText
                            }), s)
                        }
                    }
                }
            }, {
                extend: "excel",
                text: '<i class="bx bxs-file-export me-1"></i>Excel',
                className: "dropdown-item",
                exportOptions: {
                    columns: [3, 4, 5, 6, 7],
                    format: {
                        body: function (e, t, a) {
                            var s;
                            return e.length <= 0 ? e : (e = $.parseHTML(e), s = "", $.each(e, function (e, t) {
                                void 0 !== t.classList && t.classList.contains("user-name") ? s += t.lastChild.firstChild.textContent : void 0 === t.innerText ? s += t.textContent : s += t.innerText
                            }), s)
                        }
                    }
                }
            }, {
                extend: "pdf",
                text: '<i class="bx bxs-file-pdf me-1"></i>Pdf',
                className: "dropdown-item",
                exportOptions: {
                    columns: [3, 4, 5, 6, 7],
                    format: {
                        body: function (e, t, a) {
                            var s;
                            return e.length <= 0 ? e : (e = $.parseHTML(e), s = "", $.each(e, function (e, t) {
                                void 0 !== t.classList && t.classList.contains("user-name") ? s += t.lastChild.firstChild.textContent : void 0 === t.innerText ? s += t.textContent : s += t.innerText
                            }), s)
                        }
                    }
                }
            }, {
                extend: "copy",
                text: '<i class="bx bx-copy me-1" ></i>Copy',
                className: "dropdown-item",
                exportOptions: {
                    columns: [3, 4, 5, 6, 7],
                    format: {
                        body: function (e, t, a) {
                            var s;
                            return e.length <= 0 ? e : (e = $.parseHTML(e), s = "", $.each(e, function (e, t) {
                                void 0 !== t.classList && t.classList.contains("user-name") ? s += t.lastChild.firstChild.textContent : void 0 === t.innerText ? s += t.textContent : s += t.innerText
                            }), s)
                        }
                    }
                }
            }]
        }
        ],
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function (e) {
                        return "Details of " + e.data().patient.full_name
                    }
                }),
                type: "column",
                renderer: function (e, t, a) {
                    a = $.map(a, function (e, t) {
                        return "" !== e.title ? '<tr data-dt-row="' + e.rowIndex + '" data-dt-column="' + e.columnIndex + '"><td>' + e.title + ":</td> <td>" + e.data + "</td></tr>" : ""
                    }).join("");
                    return !!a && $('<table class="table"/><tbody />').append(a)
                }
            }
        }
    }
    ), $("div.head-label").html('<h5 class="card-title mb-0">Upcoming Appointment List</h5>')), 101);
    $(".datatable-doctor-upcoming-appointment-list tbody").on("click", ".delete-record", function () {
        l.row($(this).parents("tr")).remove().draw()
    }), setTimeout(() => {
        $(".dataTables_filter .form-control").removeClass("form-control-sm"), $(".dataTables_length .form-select").removeClass("form-select-sm")
    }, 300)

    $(".datatable-doctor-upcoming-appointment-list tbody").on("click", ".item-edit", function () {
        // Retrieve the data associated with the row
        var rowData = l.row($(this).parents("tr")).data();
        // Assuming your modal content has an element with the ID "modalContent"
        var modalContent = $(".modal-body");

        // Clear previous content in the modal (if any)
        modalContent.empty();

        // Close the tableHTML
        var HTML = `
        <div class="container mt-5">
            <form id="prescription-form">
                <h3 class="mb-4">Patient Information</h3>
        
                <!-- Patient Details -->
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="patient-weight" class="form-label">Weight (kg):</label>
                        <input type="text" id="patient-weight" name="patientWeight" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label for="patient-age" class="form-label">Age:</label>
                        <input type="number" id="patient-age" name="patientAge" class="form-control" required>
                    </div>
                </div>
        
                <h3 class="mb-4">Medical Information</h3>
                <!-- Medical Information -->
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="probable-diagnosis" class="form-label">Probable Diagnosis:</label>
                        <textarea id="probable-diagnosis" name="probableDiagnosis" class="form-control" required></textarea>
                    </div>
                    <div class="col-md-6">
                        <label for="medical-history" class="form-label">Brief Medical History:</label>
                        <textarea id="medical-history" name="medicalHistory" class="form-control" required></textarea>
                    </div>
                </div>
        
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="prescribed-medicine" class="form-label">Prescribed Medicine:</label>
                        <textarea id="prescribed-medicine" name="prescribedMedicine" class="form-control" required></textarea>
                    </div>
                    <div class="col-md-6">
                        <label for="extra-advice" class="form-label">Extra Advice:</label>
                        <textarea id="extra-advice" name="extraAdvice" class="form-control"></textarea>
                    </div>
                </div>
        
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="required-investigation" class="form-label">Required Investigation:</label>
                        <textarea id="required-investigation" name="requiredInvestigation" class="form-control"></textarea>
                    </div>
                    <div class="col-md-6">
                        <label for="follow-up-instructions" class="form-label">Follow-up Instructions:</label>
                        <textarea id="follow-up-instructions" name="followUpInstructions" class="form-control"></textarea>
                    </div>
                </div>
        
                <!-- Buttons -->
                <div class="text-center">
                <button type="submit" class="btn btn-primary">
                <i class='bx bx-envelope'></i> Send Email Prescription
            </button>
            <button type="submit" class="btn btn-primary">
                <i class='bx bxl-whatsapp'></i> Send to WhatsApp Prescription
            </button>
                </div>
            </form>
        </div>
    `
        // Append the table to the modal content
        modalContent.append(HTML);

        // Show the modal manually
        $('#modalCenter').modal('show');
    });

    $('.datatable-doctor-upcoming-appointment-list tbody').on('click', '.send-btn', function () {
        var rowData = l.row($(this).parents("tr")).data();
        window.location.href = `/doctor/send-prescription/${rowData.prescription_id}`;
    });


    // Event listener for saving changes in the modal
    $('#saveChangesBtn').on('click', function () {
        // Get the updated values from the modal fields
        var updatedData = {
            field1: $('#field1').val(),
            field2: $('#field2').val(),
            // ... and so on for other fields
        };

        // Perform any logic or API calls to update the data in the DataTable
        // For example:
        // table.row(selectedRow).data(updatedData).draw();

        // Close the modal after saving the changes
        $('#myModal').modal('hide');
    });


});