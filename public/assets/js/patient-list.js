$(function () {
    var l, t, e = $(".datatable-patient-list"),
        a = $(".dt-complex-header"),
        s = $(".dt-row-grouping"),
        n = $(".dt-multilingual"),
        r = (e.length && (l = e.DataTable({
            ajax: {
                url: '/patient/admin-patient-list',
                type: 'POST',
                dataSrc: ''
            },
            columns: [
                {
                    data: ""
                },
                {
                    data: "userId"
                },
                {
                    data: "userId"
                },
                {
                    data: "full_name"
                },
                {
                    data: "gender"
                },
                {
                    data: "selected_doctor"
                },
                {
                    data: "phone"
                },
                {
                    data: "user_stat"
                },
                {
                    data: "appointment_date"
                },
                {
                    data: "price"
                },
                {
                    data: "email"
                },
                {
                    data: ""
                }
            ],
            columnDefs: [{
                className: "control",
                orderable: !1,
                searchable: !1,
                responsivePriority: 2,
                targets: 0,
                render: function (e, t, a, s) {
                    return ""
                }
            }, {
                targets: 1,
                orderable: !1,
                searchable: !1,
                responsivePriority: 3,
                checkboxes: !0,
                checkboxes: {
                    selectAllRender: '<input type="checkbox" class="form-check-input">'
                },
                render: function () {
                    return '<input type="checkbox" class="dt-checkboxes form-check-input">'
                }
            }, {
                targets: 2,
                searchable: !1,
                visible: !1
            }, {
                targets: 3,
                responsivePriority: 1,
                render: function (e, t, a, s) {
                    var n = a.avatar,
                        l = a.full_name,
                        r = a.gender;
                    return '<div class="d-flex justify-content-start align-items-center user-name"><div class="avatar-wrapper"><div class="avatar me-2">' + (n ? '<img src="' + assetsPath + "img/avatars/" + n + '" alt="Avatar" class="rounded-circle">' : '<span class="avatar-initial rounded-circle bg-label-' + ["success", "danger", "warning", "info", "dark", "primary", "secondary"][Math.floor(6 * Math.random())] + '">' + (n = (((n = (l = a.full_name).match(/\b\w/g) || []).shift() || "") + (n.pop() || "")).toUpperCase()) + "</span>") + '</div></div><div class="d-flex flex-column"><span class="emp_name text-truncate">' + l + '</span><small class="emp_post text-truncate text-muted">' + r + "</small></div></div>"
                }
            }, {
                responsivePriority: 1,
                targets: 4
            }, {
                targets: -2,
                render: function (e, t, a, s) {
                    var a = a.status,
                        n = {
                            1: {
                                title: "Current",
                                class: "bg-label-primary"
                            },
                            2: {
                                title: "Professional",
                                class: " bg-label-success"
                            },
                            3: {
                                title: "Rejected",
                                class: " bg-label-danger"
                            },
                            4: {
                                title: "Resigned",
                                class: " bg-label-warning"
                            },
                            5: {
                                title: "Applied",
                                class: " bg-label-info"
                            }
                        };
                    return void 0 === n[a] ? e : '<span class="badge ' + n[a].class + '">' + n[a].title + "</span>"
                }
            }, {
                targets: -1,
                title: "Actions",
                orderable: !1,
                searchable: !1,
                render: function (e, t, a, s) {
                    return '<div class="d-inline-block"><a href="javascript:;" class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></a><ul class="dropdown-menu dropdown-menu-end m-0"><li><a href="javascript:;" class="dropdown-item">Details</a></li><li><a href="javascript:;" class="dropdown-item">Archive</a></li><div class="dropdown-divider"></div><li><a href="javascript:;" class="dropdown-item text-danger delete-record">Delete</a></li></ul></div><a href="javascript:;" class="btn btn-sm btn-icon item-edit"><i class="bx bxs-edit"></i></a>'
                }
            }],
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
                            return "Details of " + e.data().full_name
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
        }), $("div.head-label").html('<h5 class="card-title mb-0">Patient List</h5>')), 101);
    setTimeout(() => {
        $(".dataTables_filter .form-control").removeClass("form-control-sm"), $(".dataTables_length .form-select").removeClass("form-select-sm")
    }, 300)
});
