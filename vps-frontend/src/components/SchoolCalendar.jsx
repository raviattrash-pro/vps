import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const SchoolCalendar = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([
        {
            title: 'Half Yearly Exams',
            start: new Date(2025, 9, 15),
            end: new Date(2025, 9, 25),
            allDay: true,
            resource: 'Exam'
        },
        {
            title: 'Diwali Holiday',
            start: new Date(2025, 10, 1),
            end: new Date(2025, 10, 5),
            allDay: true,
            resource: 'Holiday'
        },
        {
            title: 'Sports Day',
            start: new Date(2025, 11, 20),
            end: new Date(2025, 11, 20),
            allDay: true,
            resource: 'Event'
        }
    ]);

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad';
        if (event.resource === 'Holiday') backgroundColor = '#e63946';
        if (event.resource === 'Exam') backgroundColor = '#f4a261';
        if (event.resource === 'Event') backgroundColor = '#2a9d8f';

        return {
            style: {
                backgroundColor,
                borderRadius: '5px'
            }
        };
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '24px', display: 'flex', alignItems: 'center' }}
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(45deg, #0f4c3a, #2d6a4f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Academic Calendar
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
                        Track exams, holidays, and school events
                    </p>
                </div>
            </div>

            <div className="glass-card" style={{ height: '600px', padding: '20px', background: 'white' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    defaultView='month'
                />
            </div>
        </div>
    );
};

export default SchoolCalendar;
