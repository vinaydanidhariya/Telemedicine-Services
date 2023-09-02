"use strict";
document.addEventListener("DOMContentLoaded", function (e) {
	{
		function showAlert(type, message) {
			const alertClass =
				type === "success" ? "alert-success" : "alert-danger";

			const alertHTML = `
                <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999">
                    <div class="alert ${alertClass} alert-dismissible fade show rounded-0" role="alert">
                        ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                </div>
            `;

			const $alert = $(alertHTML);
			$("#loginAlerts").html($alert);

			// Automatically dismiss the alert after 5 seconds (adjust as needed)
			setTimeout(function () {
				$alert.alert("close");
			}, 3000);
		}
		$("#submit").on("click", function () {
			const data = { opt: $("[name=otp]").val() };
			$.ajax({
				url: "/admin/verify-otp",
				type: "post",
				contentType: "application/json",
				data: JSON.stringify(data),
				success: function (response) {
					if (response.type === "success") {
						showAlert("success", response.message);
						window.location.href = "/admin/dashboard";
					} else {
						showAlert("danger", response.message);
					}
				},
				error: function (xhr) {
					if (xhr.responseJSON && xhr.responseJSON.error) {
						showAlert("danger", xhr.responseJSON.error);
					}
				},
			});
		});
		for (let t of document.querySelector(".numeral-mask-wrapper").children)
			t.onkeyup = function (e) {
				t.nextElementSibling &&
					this.value.length ===
						parseInt(this.attributes.maxlength.value) &&
					t.nextElementSibling.focus(),
					!t.previousElementSibling ||
						(8 !== e.keyCode && 46 !== e.keyCode) ||
						t.previousElementSibling.focus();
			};
		const n = document.querySelector("#twoStepsForm");
		if (n) {
			FormValidation.formValidation(n, {
				fields: {
					otp: {
						validators: {
							notEmpty: { message: "Please enter otp" },
						},
					},
				},
				plugins: {
					trigger: new FormValidation.plugins.Trigger(),
					bootstrap5: new FormValidation.plugins.Bootstrap5({
						eleValidClass: "",
						rowSelector: ".mb-3",
					}),
					submitButton: new FormValidation.plugins.SubmitButton(),
					defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
					autoFocus: new FormValidation.plugins.AutoFocus(),
				},
			});
			const i = n.querySelectorAll(".numeral-mask"),
				t = function () {
					let t = !0,
						o = "";
					i.forEach((e) => {
						"" === e.value &&
							((t = !1),
							(n.querySelector('[name="otp"]').value = "")),
							(o += e.value);
					}),
						t && (n.querySelector('[name="otp"]').value = o);
				};
			i.forEach((e) => {
				e.addEventListener("keyup", t);
			});
		}
	}
});
