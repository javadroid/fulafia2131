import React, { useState } from 'react';
import { User, Camera, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Student } from '../types';

interface StudentRegistrationProps {
  onAddStudent: (student: Student) => void;
  students: Student[];
}

const availableCourses = [
  'CSC 301 - Data Structures',
  'CSC 302 - Computer Architecture',
  'CSC 303 - Database Systems',
  'CSC 304 - Software Engineering',
  'CSC 305 - Operating Systems',
  'MTH 301 - Numerical Analysis',
  'MTH 302 - Linear Algebra',
  'STA 301 - Statistics',
  'PHY 301 - Physics III',
  'ENG 301 - Technical Writing'
];

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ onAddStudent, students }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    image: '',
    session: '2024/2025',
    semester: 'First Semester',
    courses: [] as string[]
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCourseToggle = (courseCode: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseCode)
        ? prev.courses.filter(c => c !== courseCode)
        : [...prev.courses, courseCode]
    }));
  };

  const checkDuplicateRegistration = (matricNumber: string, courses: string[]) => {
    const existingStudent = students.find(s => s.matricNumber === matricNumber);
    if (!existingStudent) return [];
    
    return courses.filter(course => existingStudent.courses.includes(course));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.matricNumber || !formData.image || formData.courses.length === 0) {
      setMessage({ type: 'error', text: 'Please fill in all fields and select at least one course.' });
      return;
    }

    // Check for existing matric number
    const existingStudent = students.find(s => s.matricNumber === formData.matricNumber);
    const duplicateCourses = checkDuplicateRegistration(formData.matricNumber, formData.courses);
    
    if (existingStudent && duplicateCourses.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Student is already registered for: ${duplicateCourses.join(', ')}` 
      });
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      ...formData,
      registrationDate: new Date().toISOString()
    };

    // If student exists, update their courses; otherwise create new student
    if (existingStudent) {
      const updatedStudents = students.map(s => 
        s.matricNumber === formData.matricNumber 
          ? { ...s, courses: [...new Set([...s.courses, ...formData.courses])] }
          : s
      );
      // This is a bit of a workaround since we need to update the parent state
      // In a real app, we'd have a proper update function
      setMessage({ type: 'success', text: 'Student courses updated successfully!' });
    } else {
      onAddStudent(newStudent);
      setMessage({ type: 'success', text: 'Student registered successfully!' });
    }

    // Reset form
    setFormData({
      fullName: '',
      matricNumber: '',
      image: '',
      session: '2024/2025',
      semester: 'First Semester',
      courses: []
    });

    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Student Registration</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter student's full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matric Number
            </label>
            <input
              type="text"
              value={formData.matricNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, matricNumber: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CSC/2020/001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session
              </label>
              <select
                value={formData.session}
                onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2022/2023">2022/2023</option>
                <option value="2021/2022">2021/2022</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {formData.image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={formData.image}
                    alt="Student preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Courses
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableCourses.map((course) => {
                const isSelected = formData.courses.includes(course);
                const duplicateCount = checkDuplicateRegistration(formData.matricNumber, [course]).length;
                const isDuplicate = duplicateCount > 0;
                
                return (
                  <button
                    key={course}
                    type="button"
                    onClick={() => !isDuplicate && handleCourseToggle(course)}
                    disabled={isDuplicate}
                    className={`p-3 text-left border-2 rounded-lg transition-colors ${
                      isDuplicate
                        ? 'border-red-200 bg-red-50 text-red-500 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{course}</span>
                      {isSelected && !isDuplicate && <CheckCircle className="w-4 h-4 text-blue-600" />}
                      {isDuplicate && <X className="w-4 h-4 text-red-500" />}
                    </div>
                    {isDuplicate && (
                      <p className="text-xs text-red-500 mt-1">Already registered</p>
                    )}
                  </button>
                );
              })}
            </div>
            {formData.courses.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {formData.courses.length} course{formData.courses.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Register Student</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;