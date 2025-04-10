import React from 'react';
import { Course } from '../types';
import { BookOpen, Clock, DollarSign } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <img 
        src={course.imageUrl} 
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-indigo-600">{course.category}</span>
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{course.duration}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700">
            <BookOpen className="w-4 h-4 mr-1" />
            <span className="text-sm">{course.instructor}</span>
          </div>
          <div className="flex items-center text-green-600 font-bold">
            <DollarSign className="w-4 h-4" />
            <span>{course.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}