"use strict";

// Initialize Cleave.js for prescription item price and quantity fields
(function () {
	var priceFields = document.querySelectorAll(".prescription-item-price");
	var qtyFields = document.querySelectorAll(".prescription-item-qty");

	priceFields.forEach(function (field) {
		new Cleave(field, { delimiter: "", numeral: true });
	});

	qtyFields.forEach(function (field) {
		new Cleave(field, { delimiter: "", numeral: true });
	});
})();

$(function () {
	var e = $(".btn-apply-changes"),
		t = $(".source-item"),
		c = {
			"Probable-Diagnosis": "Probable Diagnosis.",
			"brief-Medical-History": "Brief Medical History.",
			"prescribed-Medicine": "Prescribed Medicine.",
			"required-Investigation": "Required Investigation.",
			"follow-Up-Instructions": "Follow-Up Instructions.",
			"extra-Advice": "Extra Advice.",
		};

	function updateText(element, text) {
		element.closest(".repeater-wrapper").find(".tax-1").text(text);
	}

	// Handle clicking on the tax select element
	$(document).on("click", ".tax-select", function (e) {
		e.stopPropagation();
	});

	e.length &&
		$(document).on("click", ".btn-apply-changes", function () {
			var t = $(this),
				l = t.closest(".dropdown-menu").find("#taxInput1"),
				r = t.closest(".dropdown-menu").find("#taxInput2"),
				i = t.closest(".dropdown-menu").find("#discountInput"),
				o = t.closest(".repeater-wrapper").find(".tax-1"),
				a = t.closest(".repeater-wrapper").find(".tax-2"),
				n = $(".discount");

			if (l.val() !== null) {
				updateText(l, l.val());
			}

			if (r.val() !== null) {
				updateText(r, r.val());
			}

			if (i.val().length) {
				t.closest(".repeater-wrapper").find(n).text(i.val() + "%");
			}
		});

	t.length &&
		(t.on("submit", function (e) {
			e.preventDefault();
		}),
			t.repeater({
				show: function () {
					$(this).slideDown();

					// Initialize tooltips
					[].slice
						.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
						.map(function (e) {
							return new bootstrap.Tooltip(e);
						});
				},
				hide: function () {
					$(this).slideUp();
				},
			}));

	
	// Handle changing item details select
	$(document).on("change", ".item-details", function () {
		var e = $(this),
			t = c[e.val()];
		var textarea = $('<textarea class="form-control" rows="2">' + t + "</textarea>");

		if (e.next("textarea").length) {
			e.next("textarea").val(t);
		} else {
			e.after(textarea);
		}
	});
});
