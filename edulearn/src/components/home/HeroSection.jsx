import PropTypes from 'prop-types'
import { Button } from '../common/Button.jsx'
import { Badge } from '../common/Badge.jsx'
import { ArrowRight, PlayCircle, Sparkles, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../common/Card.jsx'

export const HeroSection = ({ onExplore, featuredCourse, enrolledIds }) => {
  const navigate = useNavigate()
  const isEnrolled = featuredCourse && enrolledIds?.has(featuredCourse._id)

  return (
    <section className="relative overflow-hidden pt-20 pb-32 lg:pt-40">
      {/* Decorative localized blobs for extra depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-fuchsia-500/20 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-200 shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Revolutionize your learning journey</span>
            </div>

            <h1 className="font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl leading-[1.1]">
              Master new skills with <br />
              <span className="text-gradient">
                EduLearn
              </span>
            </h1>

            <p className="text-lg leading-8 text-slate-600 max-w-xl">
              Unlock your potential with our expert-led courses. High-quality content designed for the modern learner, all in one premium platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onExplore}
                className="h-14 px-8 text-lg shadow-indigo-500/25"
              >
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="glass"
                onClick={() => navigate('/auth/login')}
                className="h-14 px-8 text-lg text-indigo-700 bg-white/60 hover:bg-white/80"
              >
                Get Started
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="h-full w-full" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-900">10k+ Learners</p>
                <p className="text-slate-500">trust our platform</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative lg:ml-auto w-full max-w-lg lg:max-w-none perspective-1000">
            {/* Main Glass Card */}
            <Card className="relative z-10 p-2 bg-white/40 backdrop-blur-xl border-white/60 rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-900">
                {featuredCourse ? (
                  <div className="group relative cursor-pointer" onClick={() => navigate(isEnrolled ? `/dashboard/learner/course/${featuredCourse._id}` : `/courses/${featuredCourse._id}`, { state: { preview: featuredCourse } })}>
                    <div className="aspect-video w-full overflow-hidden">
                      {featuredCourse.thumbnail ? (
                        <video
                          src={featuredCourse.thumbnail}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                          muted
                          loop
                          onMouseOver={e => e.target.play()}
                          onMouseOut={e => e.target.pause()}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-800 text-slate-600">
                          <PlayCircle size={64} className="text-white/50" />
                        </div>
                      )}

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30 backdrop-blur-md">Featured</Badge>
                        <span className="text-xs font-medium text-slate-300">{featuredCourse.totalVideos || 0} lessons</span>
                      </div>
                      <h3 className="text-2xl font-display font-bold mb-2">{featuredCourse.title}</h3>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white">
                            {featuredCourse.instructor?.name?.[0] || 'I'}
                          </div>
                          <span className="text-sm font-medium text-slate-200">
                            {featuredCourse.instructor?.name || 'Instructor'}
                          </span>
                        </div>
                        {isEnrolled ? (
                          <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Enrolled</Badge>
                        ) : (
                          <span className="text-xl font-bold text-white">
                            ${featuredCourse.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center text-slate-400">
                    Loading...
                  </div>
                )}
              </div>
            </Card>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -left-8 z-20 animate-float">
              <Card className="flex items-center gap-4 p-4 !bg-white/90">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active Learners</p>
                  <p className="text-lg font-bold text-slate-900">2,400+</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

HeroSection.propTypes = {
  onExplore: PropTypes.func.isRequired,
  featuredCourse: PropTypes.object,
  enrolledIds: PropTypes.object,
}


