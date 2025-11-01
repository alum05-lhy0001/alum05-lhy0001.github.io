import React from 'react'

const COURSES = [
  'Diving into the World of IT and Software Development',
  'Fundamentals of Core Java',
  'Exploring Spring and Spring Boot: Building Robust Java Applications',
  'Fundamentals of JavaScript and Web Development',
  'Frontend Framework: Introduction to React',
  'Software Design and Architecture in Web Development',
  'Exploring Database Technologies: NoSQL, Traditional Databases, Redis, and Kafka for Efficient Data Management and Caching',
  'Introduction to Linux',
  'Foundation of DevOps, Docker and Container Platform Fundamentals',
  '(SCTP) Full Stack Developer - Capstone Project',
  'Coding with AI: GitHub Co-Pilot',
  'Advanced Spring and Spring Boot: Building Robust Java Applications',
  'Frontend Framework: Advanced JS and React',
  'Advanced Database Technologies: NoSQL, Traditional Databases, Redis, and Kafka for Efficient Data Management and Caching',
  'Managing Applications in OpenShift Container Platform: Deployment, Scaling, Monitoring, and Secrets Integration',
  'Efficient Software Development Workflow: Version Control, GitHub, Build Images, and Swagger Design for RESTful APIs',
  'Introduction to Cloud Computing / Cloud Native Design',
  'DevOps Introduction: Working with CI/CD and Continuous Monitoring Tools',
]

export default function Courses() {
  return (
    <div>
      <h2>Courses</h2>
      <ul className="list">
        {COURSES.map((course, idx) => (
          <li key={idx}>{course}</li>
        ))}
      </ul>
    </div>
  )
}
