import Student from '../models/student.js'

export function getAllStudents(req, res) {
    Student.find().then(
        (student) => {
            res.json(student)
            console.log(req)
        }
    )
}

export async function getAllStudentsNew(req, res) {
    try {
        const students = await Student.find();
        res.json(students);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

export function createStudent(req, res) {

    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    if (!req.user.isAdmin) {
        res.status(403).json({ message: "Only admins can create students" })
        return
    }

    const newStudent = new Student(req.body)

    newStudent.save().then(
        () => {
            res.json({
                message: "Student saved successfully!"
            })
        }
    )
}

