"use strict";
$(function () {
    let l, t, e = $(".datatable-payment-list"),
        a = $(".dt-complex-header"),
        s = $(".dt-row-grouping"),
        r = (e.length && (l = e.DataTable({
            ajax: {
                url: '/payment/payment-list',
                type: 'POST',
                dataSrc: ''
            },
            columns: [
                {
                    data: ""
                }, {
                    data: "transaction_Id"
                }, {
                    data: "transaction_Id"
                }, {
                    data: "payer_name"
                }, {
                    data: "payment_amount"
                }, {
                    data: "payment_date"
                }, {
                    data: "order_id"
                }, {
                    data: "Payment_transaction_id"
                }, {
                    data: "payer_user_id"
                }, {
                    data: "payer_mobile"
                }, {
                    data: "payer_email"
                }, {
                    data: "payment_status"
                }, {
                    data: ""
                }],
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
            },
            {
                targets: 3,
                responsivePriority: 1,
                render: function (e, t, a, s) {
                    var n = undefined,
                        l = a.payer_name,
                        r = a.payer_mobile;
                    return '<div class="d-flex justify-content-start align-items-center user-name"><div class="avatar-wrapper"><div class="avatar me-2">' + (n ? '<img src="' + assetsPath + "img/avatars/" + "1.png" + '" alt="Avatar" class="rounded-circle">' : '<span class="avatar-initial rounded-circle bg-label-' + ["success", "danger", "warning", "info", "dark", "primary", "secondary"][Math.floor(6 * Math.random())] + '">' + (n = (((n = (l = a.payer_name).match(/\b\w/g) || []).shift() || "") + (n.pop() || "")).toUpperCase()) + "</span>") + '</div></div><div class="d-flex flex-column"><span class="emp_name text-truncate">' + l + '</span><small class="emp_post text-truncate text-muted">' + r + "</small></div></div>"
                }
            },

            {
                responsivePriority: 1,
                targets: 4,
                render: function (e, t, a, s) {
                    var n = a.payment_amount
                    return n
                }
            },
            {
                responsivePriority: 1,
                targets: 5,
                render: function (e, t, a, s) {
                    var n = a.payment_date
                    return moment(n).format("MM-DD-YYYY hh:mm A");
                }
            },
            {
                responsivePriority: 1,
                targets: 6,
                render: function (e, t, a, s) {
                    var n = a.order_id
                    return n
                }
            },
            {
                responsivePriority: 1,
                targets: 7,
                render: function (e, t, a, s) {
                    var n = a.Payment_transaction_id
                    return n
                }
            },
            {
                responsivePriority: 1,
                targets: 8,
                render: function (e, t, a, s) {
                    var a = a.payment_status,
                        n = {
                            true: {
                                title: "ACTIVE",
                                class: "bg-label-success"
                            },
                            false: {
                                title: "INACTIVE",
                                class: " bg-label-danger"
                            }
                        };
                    return '<span class="badge ' + n[true].class + '">' + a + "</span>"
                }
            },
            {
                responsivePriority: 3,
                targets: 9,
                render: function (e, t, a, s) {
                    var n = a.payer_user_id
                    return n
                }
            },
            {
                responsivePriority: 2,
                targets: 10,
                render: function (e, t, a, s) {
                    var n = a.payer_name
                    return n
                }
            },
            {
                responsivePriority: 2,
                targets: 11,
                render: function (e, t, a, s) {
                    var n = a.payer_email
                    return n
                }
            },
            {
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
            }],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (e) {
                            return "Details of " + e.data().payer_name
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
        }), $("div.head-label").html('<h5 class="card-title mb-0">LIST OF DOCTORS</h5>')), 101);

    $(".datatable-payment-list tbody").on("click", ".delete-record", function () {
        l.row($(this).parents("tr")).remove().draw()
    })
});
