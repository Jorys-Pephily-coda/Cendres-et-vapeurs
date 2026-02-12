const API_BASE_URL = 'http://localhost:8000/api/calendar'

export const fetchEvents = async (startDate?: string, endDate?: string, priority?: string) => {
    try {
        const params = new URLSearchParams()
        if (startDate) params.append('start_date', startDate)
        if (endDate) params.append('end_date', endDate)
        if (priority) params.append('priority', priority)

        const response = await fetch(`${API_BASE_URL}/events/?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Events fetched successfully:', data)
            return data
        } else {
            console.error('Failed to fetch events:', response.statusText)
            return null
        }
    } catch (error) {
        console.error('Error during fetching events:', error)
        return null
    }
}

export const fetchMonthEvents = async (year: number, month: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/month_view/?year=${year}&month=${month}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Month events fetched successfully:', data)
            return data
        } else {
            console.error('Failed to fetch month events:', response.statusText)
            return null
        }
    } catch (error) {
        console.error('Error during fetching month events:', error)
        return null
    }
}

export const createEvent = async (eventData: {
    title: string
    description?: string
    start_date: string
    end_date: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
    is_all_day?: boolean
    location?: string
}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(eventData),
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Event created successfully:', data)
            return data
        } else {
            const error = await response.json()
            console.error('Failed to create event:', error)
            return null
        }
    } catch (error) {
        console.error('Error during creating event:', error)
        return null
    }
}

export const updateEvent = async (eventId: number, eventData: Partial<{
    title: string
    description: string
    start_date: string
    end_date: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    is_all_day: boolean
    location: string
}>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(eventData),
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Event updated successfully:', data)
            return data
        } else {
            const error = await response.json()
            console.error('Failed to update event:', error)
            return null
        }
    } catch (error) {
        console.error('Error during updating event:', error)
        return null
    }
}

export const deleteEvent = async (eventId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.ok) {
            console.log('Event deleted successfully')
            return true
        } else {
            console.error('Failed to delete event:', response.statusText)
            return false
        }
    } catch (error) {
        console.error('Error during deleting event:', error)
        return false
    }
}

export const fetchPriorities = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/priorities/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Priorities fetched successfully:', data)
            return data.priorities
        } else {
            console.error('Failed to fetch priorities:', response.statusText)
            return null
        }
    } catch (error) {
        console.error('Error during fetching priorities:', error)
        return null
    }
}

export const fetchShiftNotes = async (date?: string, shift?: 'morning' | 'evening', userId?: number) => {
    try {
        const params = new URLSearchParams()
        if (date) params.append('date', date)
        if (shift) params.append('shift', shift)
        if (userId) params.append('user_id', userId.toString())

        const response = await fetch(`${API_BASE_URL}/notes/?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Shift notes fetched successfully:', data)
            return data
        } else {
            console.error('Failed to fetch shift notes:', response.statusText)
            return null
        }
    } catch (error) {
        console.error('Error during fetching shift notes:', error)
        return null
    }
}

export const fetchMyNotes = async (date?: string) => {
    try {
        const params = new URLSearchParams()
        if (date) params.append('date', date)

        const response = await fetch(`${API_BASE_URL}/notes/my_notes/?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.ok) {
            const data = await response.json()
            console.log('My notes fetched successfully:', data)
            return data
        } else {
            console.error('Failed to fetch my notes:', response.statusText)
            return null
        }
    } catch (error) {
        console.error('Error during fetching my notes:', error)
        return null
    }
}

export const createShiftNote = async (noteData: {
    date: string
    shift: 'morning' | 'evening'
    content: string
    is_important?: boolean
}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(noteData),
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Shift note created successfully:', data)
            return data
        } else {
            const error = await response.json()
            console.error('Failed to create shift note:', error)
            return null
        }
    } catch (error) {
        console.error('Error during creating shift note:', error)
        return null
    }
}

export const updateShiftNote = async (noteId: number, noteData: Partial<{
    date: string
    shift: 'morning' | 'evening'
    content: string
    is_important: boolean
}>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(noteData),
        })

        if (response.ok) {
            const data = await response.json()
            console.log('Shift note updated successfully:', data)
            return data
        } else {
            const error = await response.json()
            console.error('Failed to update shift note:', error)
            return null
        }
    } catch (error) {
        console.error('Error during updating shift note:', error)
        return null
    }
}

export const deleteShiftNote = async (noteId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.ok) {
            console.log('Shift note deleted successfully')
            return true
        } else {
            console.error('Failed to delete shift note:', response.statusText)
            return false
        }
    } catch (error) {
        console.error('Error during deleting shift note:', error)
        return false
    }
}
