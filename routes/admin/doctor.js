const express = require("express");
const router = express.Router();
const db = require("../../models");
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");
const Path = require('path');
const moment = require('moment');
const { convertToMd5 } = require("../../utils/helper.js");
const { where } = require("sequelize");
const authentication = require("../../middleware/login_module").check_auth;

router.get("/add-doctor", authentication, checkAccess('admin/doctor/add-doctor'), async function (req, res, next) {
	try {
		res.render("doctors/add-doctor", {
			title: "Doctor- Add Doctor",
		});
	} catch (error) {
		console.log(error);
	}
});

const storage = multer.diskStorage({
	// Define the destination for uploaded files
	destination: function (req, file, cb) {
		// Set the destination path for different file types (you may adjust this as needed)
		if (file.fieldname === 'profile') {
			const uploadDirectory = Path.join(__dirname, '../../uploads/profiles/');
			cb(null, uploadDirectory);
		} else if (file.fieldname === 'degreeCertificate') {
			const uploadDirectory = Path.join(__dirname, '../../uploads/degree-certificates/');
			cb(null, uploadDirectory);
		} else if (file.fieldname === 'aadharCard') {
			const uploadDirectory = Path.join(__dirname, '../../uploads/aadhar-cards/');
			cb(null, uploadDirectory);
		} else if (file.fieldname === 'panCard') {
			const uploadDirectory = Path.join(__dirname, '../../uploads/pan-cards/');
			cb(null, uploadDirectory);
		} else if (file.fieldname === 'digitalSignature') {
			const uploadDirectory = Path.join(__dirname, '../../uploads/digital-signatures/');
			cb(null, uploadDirectory);
		} else {
			cb(new Error('Invalid fieldname for file upload.'));
		}
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const fileExtension = file.originalname.split('.').pop();
		cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension);
	}
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 10 // 10 MB
	},
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	}
}).fields([
	{ name: 'profile', maxCount: 1 },
	{ name: 'degreeCertificate', maxCount: 1 },
	{ name: 'aadharCard', maxCount: 1 },
	{ name: 'panCard', maxCount: 1 },
	{ name: 'digitalSignature', maxCount: 1 }
]);

function checkFileType(file, cb) {
	if (file.fieldname === 'profile') {
		if (
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/jpg' ||
			file.mimetype === 'image/jpeg' ||
			file.mimetype === 'image/gif'
		) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and GIF images are allowed.'));
		}
	} else if (file.fieldname === 'degreeCertificate') {
		if (
			file.mimetype === 'application/pdf' ||
			file.mimetype === 'application/msword' ||
			file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed for degree certificates.'));
		}
	} else if (file.fieldname === 'aadharCard') {
		if (
			file.mimetype === 'application/pdf' ||
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/jpg' ||
			file.mimetype === 'image/jpeg'
		) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed for Aadhar cards.'));
		}
	} else if (file.fieldname === 'panCard') {
		if (
			file.mimetype === 'application/pdf' ||
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/jpg' ||
			file.mimetype === 'image/jpeg'
		) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed for Pan cards.'));
		}
	} else if (file.fieldname === 'digitalSignature') {
		// Define the allowed file types for the digital signature field (you may adjust this as needed)
		// For example, allow only PDF files for digital signatures
		if (file.mimetype === 'application/pdf') {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PDF files are allowed for digital signatures.'));
		}
	} else {
		cb(new Error('Invalid fieldname for file upload.'));
	}
}

router.post("/add-doctor", checkAccess('post/admin/doctor/add-doctor'), async function (req, res, next) {
	try {

		upload(req, res, (err) => {
			if (err) {
				console.log('Error while uploading image');
				console.log(err);
				return res.send({
					type: 'error',
					message: err.message
				});
			} else {
				console.log("here");
				const {
					firstName,
					lastName,
					email,
					password,
					phone,
					dateOfBirth,
					price,
					qualification,
					department,
					gender,

					countryCode,
					degreeText,
					university,
					graduationYear,
					physicalPractice,
					experience,
					doctorRegistrationNumber,
					onlineConsultationTimeFrom,
					onlineConsultationTimeTo,
					clinicTimeFrom,
					clinicTimeTo,

				} = req.body;

				console.log(dateOfBirth);

				const [day, month, year] = dateOfBirth.split('/');

				// JavaScript Date object uses month values starting from 0 (January is 0, February is 1, and so on),
				// so we need to subtract 1 from the month value before creating the Date object.	
				const newDateOfBirth = new Date(year, month - 1, day);

				try {
					console.log(req.body, req.files, req.files.profile[0].filename);
					const passwordEncrypt = convertToMd5(password);
					db.User.create({
						firstName,
						lastName,
						type: "DOCTOR",
						email,
						qualifications: qualification,
						department,
						gender,
						price,
						dateOfBirth: newDateOfBirth,
						password: passwordEncrypt,
						status: true,
						photoUrl: req.files.profile[0].filename,

						degreeText,
						university,
						graduationYear,

						physicalPractice,
						experience,
						doctorRegistrationNumber,
						onlineConsultationTimeFrom,
						onlineConsultationTimeTo,
						clinicTimeFrom,
						clinicTimeTo,

						degreeUrl: `/uploads/degree_certificates/${req.files.degreeCertificate[0].filename}`,
						aadharCardUrl: `/uploads/aadhar_cards/${req.files.aadharCard[0].filename}`,
						panCardUrl: `/uploads/pan_cards/${req.files.panCard[0].filename}`,
						digitalSignatureUrl: `/uploads/digital_signatures/${req.files.digitalSignature[0].filename}`,

						phone: `${phone}`,
						createdDate: new Date(),
						updatedDate: new Date(),
					})
						.then(createdUser => {
							console.log(createdUser.firstName);
							let message = `${createdUser.firstName + " " + createdUser.lastName} Added Doctor successfully`
							res.send({
								status: 200,
								message,
								type: "success",
							});
						})
						.catch(error => {
							console.log(error);
							res.send({
								status: 400,
								message: `Something Went Wrong while adding Doctor`,
								type: "fails",
							});
						});
				} catch (error) {
					console.log(error);
					res.send({
						status: 500,
						message: error.message,
						type: "error",
					});
				}
			}
		})
	} catch (error) {
		console.log(error);
	}
});

router.get("/edit-doctor", authentication, checkAccess("admin/doctor/edit-doctor"), async function (req, res, next) {
	try {
		const { edit } = req.query;
		if (edit) {
			const data = await db.User.findOne({
				where: { userId: edit }
			})
			const newData = data.toJSON()
			console.log(data.toJSON());
			const formattedDate = moment(data.dateOfBirth).format("DD/MM/YYYY");
			res.render("doctors/edit-doctor", {
				title: "DOCTORS",
				data: newData,
				formattedDate
			});
		}
		else {
			res.render("error");
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/edit-doctor", authentication, checkAccess("admin/doctor/edit-doctor"), async function (req, res, next) {
	try {

		upload(req, res, (err) => {
			if (err) {
				console.log('Error while uploading image');
				console.log(err);
				return res.send({
					type: 'error',
					message: err.message
				});
			} else {
				console.log("here");
				const {
					firstName,
					lastName,
					email,
					password,
					phone,
					dateOfBirth,
					price,
					qualification,
					department,
					gender,
					doctor,
					// countryCode,
					degreeText,
					university,
					graduationYear,
					physicalPractice,
					experience,
					doctorRegistrationNumber,
					onlineConsultationTimeFrom,
					onlineConsultationTimeTo,
					clinicTimeFrom,
					clinicTimeTo,

				} = req.body;
				console.log(department);

				const [day, month, year] = dateOfBirth.split('/');
				const newDateOfBirth = new Date(year, month - 1, day);

				try {
					if (req.file) {
						console.log(req.body, req.files, req.files.profile[0].filename);
						db.User.update(
							{
								firstName,
								lastName,
								type: "DOCTOR",
								email,
								qualifications: qualification,
								department,
								gender,
								price,
								dateOfBirth: newDateOfBirth,
								status: true,
								photoUrl: req.files.profile[0].filename,

								degreeText,
								university,
								graduationYear,

								physicalPractice,
								experience,
								doctorRegistrationNumber,
								onlineConsultationTimeFrom,
								onlineConsultationTimeTo,
								clinicTimeFrom,
								clinicTimeTo,

								degreeUrl: `/uploads/degree_certificates/${req.files.degreeCertificate[0].filename}`,
								aadharCardUrl: `/uploads/aadhar_cards/${req.files.aadharCard[0].filename}`,
								panCardUrl: `/uploads/pan_cards/${req.files.panCard[0].filename}`,
								digitalSignatureUrl: `/uploads/digital_signatures/${req.files.digitalSignature[0].filename}`,

								phone: `${phone}`,
								createdDate: new Date(),
								updatedDate: new Date(),
							},
							{ where: { userId: doctor } },
						)
							.then(createdUser => {
								console.log(createdUser.firstName);
								let message = `${createdUser.firstName + " " + createdUser.lastName} Added Doctor successfully`
								res.send({
									status: 200,
									message,
									type: "success",
								});
							})
							.catch(error => {
								console.log(error);
								res.send({
									status: 400,
									message: `Something Went Wrong while adding Doctor`,
									type: "fails",
								});
							});
					} else {
						db.User.update(
							{
								firstName,
								lastName,
								type: "DOCTOR",
								email,
								qualifications: qualification,
								department,
								gender,
								price,
								dateOfBirth: newDateOfBirth,
								status: true,

								degreeText,
								university,
								graduationYear,

								physicalPractice,
								experience,
								doctorRegistrationNumber,
								onlineConsultationTimeFrom,
								onlineConsultationTimeTo,
								clinicTimeFrom,
								clinicTimeTo,

								// phone: `${countryCode} ${phone}`,
								createdDate: new Date(),
								updatedDate: new Date(),
							},
							{ where: { userId: doctor } },
						)
							.then(updatedUser => {
								let message = `${firstName + " " + lastName} \n Update Doctor successfully`
								res.send({
									status: 200,
									message,
									type: "success",
								});
							})
							.catch(error => {
								console.log(error);
								res.send({
									status: 400,
									message: `Something Went Wrong while updating Doctor`,
									type: "fails",
								});
							});
					}
				} catch (error) {
					console.log(error);
					res.send({
						status: 500,
						message: error.message,
						type: "error",
					});
				}
			}
		});
	} catch (error) {
		console.log(error);
	}
});

router.get("/doctors-list", authentication, checkAccess("admin/doctor/doctors-list"), async function (req, res, next) {
	try {
		res.render("doctors/list-doctors", {
			title: "DOCTORS",
		});
	} catch (error) {
		console.log(error);
	}
});

router.post("/doctor-list", async function (req, res, next) {
	console.log(req.body);
	try {
		const { code, department } = req.body;
		// if (code === "778899") {
		const USER = await db.User.findAll({
			attributes: [
				"userId",
				"firstName",
				"lastName",
				"email",
				"price",
				"department",
				"qualifications",
				"photo_url",
				"status",
				"delete" // 'delete' is a reserved keyword in JavaScript, use it with caution
			],
			where: {
				delete: false
			}
		});
		console.log(USER);
		res.send(USER);
		// } else {
		//   res.send("error");
		// }
	} catch (error) {
		console.log(error);
	}
});

router.post("/doctor-department", authentication, checkAccess("post/admin/doctor/department-list"), async function (req, res, next) {
	try {
		const { code } = req.body;
		console.log(req.body);
		if (code === "778899") {
			const listOfDepartment = await db.Department.findAll({
				order: [
					['department_name', 'ASC'],
				],
				attributes: [
					['department_id', 'id'],
					[
						'department_name',
						'title'
					],
				],
				raw: true,
				tableName: "department"
			});
			console.log(listOfDepartment);
			res.send(listOfDepartment);
		} else {
			res.send("error");
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/delete-doctor", authentication, checkAccess("post/admin/doctor/delete-doctor"), async function (req, res, next) {
	try {
		const { code, userId } = req.body;
		console.log(req.body);
		if (code === "778899") {
			await db.User.update({
				delete: true
			}, {
				where: {
					userId
				}
			})
			res.send({
				status: 200,
				message: "Doctor Deleted successfully",
				type: "success",
			});

		} else {
			res.send({
				status: 400,
				message: `unauthorized request`,
				type: "fails",
			});
		}
	} catch (error) {
		console.log(error);
		res.send({
			status: 400,
			message: `Error While Deleting Doctor ${error}`,
			type: "fails",
		});
	}
});

module.exports = router;
