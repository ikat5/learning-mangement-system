import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Badge } from '../ui/badge.jsx'

export const HeroSection = ({ onExplore }) => (
  <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 md:flex-row md:items-center">
    <div className="flex-1 space-y-6">
      <Badge className="w-fit bg-emerald-50 text-emerald-600">
        Next-gen LMS Experience
      </Badge>
      <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
        Empower learning journeys with{' '}
        <span className="bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">
          EduLearn
        </span>
      </h1>
      <p className="text-lg text-slate-600">
        Modular dashboards for learners, instructors, and admins. Track progress, deliver content,
        and understand revenue in one refined workspace.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button className="shadow-xl" onClick={onExplore}>
          Explore Courses
        </Button>
        <Button variant="outline">Book a Demo</Button>
      </div>
      <div className="flex gap-8 text-sm text-slate-500">
        <div>
          <p className="text-2xl font-semibold text-slate-900">1856+</p>
          Active Learners
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900">38</p>
          Elite Instructors
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900">$6.4M</p>
          Revenue Delivered
        </div>
      </div>
    </div>
    <div className="flex-1 rounded-[32px] bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-400 p-1 shadow-[0_20px_60px_rgba(79,70,229,0.35)]">
      <div className="h-full w-full rounded-[30px] bg-white/95 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Platform Snapshot</h3>
        <div className="mt-6 grid gap-4">
          {['Learner progress', 'Instructor earnings', 'Admin revenue'].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

HeroSection.propTypes = {
  onExplore: PropTypes.func.isRequired,
}

