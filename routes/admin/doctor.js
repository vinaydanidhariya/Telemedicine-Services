const express = require("express");
const router = express.Router();
const db = require("../../models");
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");
const Path = require('path');
const moment = require('moment');
const { convertToMd5 } = require("../../utils/helper.js");
const authentication = require("../../middleware/login_module").check_auth;

router.get("/add-doctor", authentication, checkAccess('admin/doctor/add-doctor'), async function (req, res, next) {
	try {
		res.render("doctors/add-doctor", {
			title: "CONSULTANT- ADD CONSULTANT",
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
			const uploadDirectory = Path.join(__dirname, '../../public/images/profile/');
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
		// Check file size for the 'profile' image (max size: 400 KB)
		if (
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/jpg' ||
			file.mimetype === 'image/jpeg' ||
			file.mimetype === 'image/gif'
		) {
			cb(null, true);
		} else {
			return cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and GIF images are allowed.'));
		}
	}
	else if (file.fieldname === 'degreeCertificate') {
		if (
			file.mimetype === 'application/pdf'
			// ||
			//file.mimetype === 'application/msword' ||
			//file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed for degree certificates.'));
		}
	} else if (file.fieldname === 'aadharCard') {
		if (
			file.mimetype === 'application/pdf'
			//||
			//file.mimetype === 'image/png' ||
			//file.mimetype === 'image/jpg' ||
			//file.mimetype === 'image/jpeg'
		) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed for Aadhar cards.'));
		}
	} else if (file.fieldname === 'panCard') {
		if (
			file.mimetype === 'application/pdf'
			//||
			//file.mimetype === 'image/png' ||
			//file.mimetype === 'image/jpg' ||
			//file.mimetype === 'image/jpeg'
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
				const profileImage = req.files.profile[0];

				// Check if the file size is less than or equal to 400 KB
				if (profileImage && profileImage.size >= 400 * 1024) {
					return res.send({
						status: 400,
						message: "Profile image size should be less than or equal to 400KB",
						type: "fails",
					});
				}
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

				const [day, month, year] = dateOfBirth.split('/');
				const newDateOfBirth = new Date(year, month - 1, day);

				const passwordEncrypt = convertToMd5(password);
				const userObj = {
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
					photoUrl: `/images/profile/${req.files.profile[0].filename}`,
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
				};

				db.User.create(userObj)
					.then(createdUser => {
						let message = `${createdUser.firstName + " " + createdUser.lastName} Added Doctor successfully`
						res.send({
							status: 200,
							message,
							type: "success",
						});
					})
					.catch(error => {
						console.log(error);
						if (error.name === 'SequelizeUniqueConstraintError' && error.fields.email) {
							// Handle unique email constraint error
							return res.send({
								status: 400,
								message: "Email already exists.",
								type: "fails",
							});
						} else if (error.name === 'SequelizeUniqueConstraintError' && error.fields.phone) {
							// Handle unique phone constraint error
							return res.send({
								status: 400,
								message: "Phone Number already exists.",
								type: "fails",
							});
						} else {
							// Handle other errors
							return res.send({
								status: 400,
								message: error.message,
								type: "fails",
							});
						}
					});
			}
		});
	} catch (error) {
		console.log(error);
		res.send({
			status: 500,
			message: error.message,
			type: "error",
		});
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
			const formattedDate = moment(data.dateOfBirth).format("DD/MM/YYYY");
			res.render("doctors/edit-doctor", {
				title: "CONSULTANT EDIT",
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
				const [day, month, year] = dateOfBirth.split('/');
				const newDateOfBirth = new Date(year, month - 1, day);

				let updateData = {
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

					phone: `${phone}`,
				};

				// Check if the image fields are sent in the request
				if (req.files) {
					const uploadedFiles = req.files;

					// Update profile image if present
					if (uploadedFiles.profile) {
						updateData.photoUrl = `/uploads/profile_images/${uploadedFiles.profile[0].filename}`;
					}

					// Update degree certificate if present
					if (uploadedFiles.degreeCertificate) {
						updateData.degreeUrl = `/uploads/degree_certificates/${uploadedFiles.degreeCertificate[0].filename}`;
					}

					// Update aadhar card if present
					if (uploadedFiles.aadharCard) {
						updateData.aadharCardUrl = `/uploads/aadhar_cards/${uploadedFiles.aadharCard[0].filename}`;
					}

					// Update pan card if present
					if (uploadedFiles.panCard) {
						updateData.panCardUrl = `/uploads/pan_cards/${uploadedFiles.panCard[0].filename}`;
					}

					// Update digital signature if present
					if (uploadedFiles.digitalSignature) {
						updateData.digitalSignatureUrl = `/uploads/digital_signatures/${uploadedFiles.digitalSignature[0].filename}`;
					}
				}

				try {
					db.User.update(
						updateData
						,
						{ where: { userId: doctor } },
					)
						.then(createdUser => {
							updateData = {}; // Assigning an empty object to clear the data
							let message = `${firstName + " " + lastName} Added Doctor successfully`
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
		});
	} catch (error) {
		console.log(error);
	}
});

router.get("/doctors-list", authentication, checkAccess("admin/doctor/doctors-list"), async function (req, res, next) {
	try {
		res.render("doctors/list-doctors", {
			title: "CONSULTANT LIST",
		});
	} catch (error) {
		console.log(error);
	}
});

router.post("/doctor-list", async function (req, res, next) {
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
				"photoUrl",
				"status",
				"delete"
			],
			where: {
				delete: false
			}
		});
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
