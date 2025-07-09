import React from 'react'
import useAuthStore from '../stores/authStore'

function SeparationFromStaff() {
    const {user}=useAuthStore() //_id user k under h 
  return (
    <div>SeparationFromStaff</div>
  )
}

export default SeparationFromStaff