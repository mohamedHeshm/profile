import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type SyntheticEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from '../../components/Icons'
import { projectPath, type ProjectCard } from '../../lib/projects'

// Concentric orbits.
// l is the detail level:
// 1 = always
// 2 = hidden on phones
// 3 = desktop only
const RINGS = [
  { r: 70, dur: 150, rev: false, l: 1 },
  { r: 125, dur: 120, rev: true, l: 1 },
  { r: 180, dur: 190, rev: false, l: 2 },
  { r: 235, dur: 230, rev: true, l: 3 },
]

// [ring, angle]: pairs sit opposite each other
// so every detail level stays balanced.
const P_SLOTS: [number, number][] = [
  [1, -90],
  [1, 90],
  [2, 0],
  [2, 180],
  [3, -60],
]

const T_SLOTS: [number, number][] = [
  [0, 45],
  [0, 225],
  [2, -90],
  [2, 90],
  [3, 15],
  [3, 195],
]

const at = (r: number, deg: number) => ({
  x: r * Math.cos((deg * Math.PI) / 180),
  y: r * Math.sin((deg * Math.PI) / 180),
})

interface Pop {
  i: number
  x: number
  y: number
  open: boolean
}

interface Props {
  projects: ProjectCard[]
  stack: string[]
  initials: string
}

/**
 * Hero visual:
 * the owner's real projects and technologies
 * as a quiet orbital system around a core.
 */
export default function EngineeringMap({
  projects,
  stack,
  initials,
}: Props) {
  const navigate = useNavigate()
  const box = useRef<HTMLDivElement>(null)
  const [pop, setPop] = useState<Pop | null>(null)

  const list = [...projects]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, P_SLOTS.length)

  const techs = stack.slice(0, T_SLOTS.length)

  useEffect(() => {
    const el = box.current

    if (!el || !('IntersectionObserver' in window)) return

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.removeAttribute('data-off')
      } else {
        el.setAttribute('data-off', '')
      }
    })

    io.observe(el)

    return () => io.disconnect()
  }, [])

  const show = (i: number, e: SyntheticEvent<Element>) => {
    const dot = e.currentTarget.querySelector('.dot')
    const b = box.current

    if (!dot || !b) return

    const r = dot.getBoundingClientRect()
    const v = b.getBoundingClientRect()

    setPop({
      i,
      x: r.left - v.left + r.width / 2,
      y: r.top - v.top + r.height / 2,
      open: true,
    })
  }

  const hide = () => {
    setPop((p) => (p ? { ...p, open: false } : p))
  }

  const open = (e: MouseEvent<Element>, path: string) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.button !== 0
    ) {
      return
    }

    e.preventDefault()

    navigate(path, {
      viewTransition: true,
    })
  }

  const w = box.current?.clientWidth ?? 600
  const shown = pop ? list[pop.i] : undefined

  return (
    <div
      ref={box}
      className="viz"
      data-hover={pop?.open || undefined}
    >
      <svg
        viewBox="-300 -300 600 600"
        role="group"
        aria-label="Map of projects and technologies"
      >
        <g aria-hidden="true">
          {RINGS.map((rg, k) => (
            <circle
              key={k}
              className="ring"
              r={rg.r}
              data-l={rg.l}
            />
          ))}

          <circle
            className="core-pulse"
            r="24"
          />
        </g>

        {RINGS.map((rg, k) => (
          <g
            key={k}
            data-l={rg.l}
          >
            <g
              className="orbit"
              style={
                {
                  '--dur': `${rg.dur}s`,
                  '--dir': rg.rev ? 'reverse' : 'normal',
                  '--rdir': rg.rev ? 'normal' : 'reverse',
                } as CSSProperties
              }
            >
              <circle
                className="pt"
                r="1.6"
                cx={at(
                  rg.r,
                  150 + k * 20,
                ).x}
                cy={at(
                  rg.r,
                  150 + k * 20,
                ).y}
                aria-hidden="true"
              />

              <circle
                className="pt"
                r="1.6"
                cx={at(
                  rg.r,
                  330 + k * 20,
                ).x}
                cy={at(
                  rg.r,
                  330 + k * 20,
                ).y}
                aria-hidden="true"
              />

              {list.map((p, i) => {
                if (P_SLOTS[i][0] !== k) {
                  return null
                }

                const { x, y } = at(
                  rg.r,
                  P_SLOTS[i][1],
                )

                const path = projectPath(p)

                return (
                  <g
                    key={p.id}
                    className={`vp${
                      pop?.open && pop.i === i
                        ? ' on'
                        : ''
                    }`}
                  >
                    <line
                      className="spoke"
                      x1="0"
                      y1="0"
                      x2={x}
                      y2={y}
                      aria-hidden="true"
                    />

                    <g transform={`translate(${x} ${y})`}>
                      <g className="ctr">
                        <a
                          href={path}
                          className="vnode"
                          aria-label={`Open project: ${p.title}`}
                          onClick={(e) =>
                            open(e, path)
                          }
                          onPointerEnter={(e) =>
                            show(i, e)
                          }
                          onFocus={(e) =>
                            show(i, e)
                          }
                          onPointerLeave={hide}
                          onBlur={hide}
                        >
                          <circle
                            r="24"
                            fill="transparent"
                          />

                          <g className="grow">
                            <circle
                              className="halo"
                              r="19"
                            />

                            <circle
                              className="dot"
                              r="13"
                            />

                            {p.image_url ? (
                              <>
                                <clipPath
                                  id={`vz-c${i}`}
                                >
                                  <circle r="12" />
                                </clipPath>

                                <image
                                  href={p.image_url}
                                  x="-12"
                                  y="-12"
                                  width="24"
                                  height="24"
                                  preserveAspectRatio="xMidYMin slice"
                                  clipPath={`url(#vz-c${i})`}
                                />
                              </>
                            ) : (
                              <text
                                className="vinit"
                                textAnchor="middle"
                                y="3.5"
                              >
                                {p.title.slice(0, 1)}
                              </text>
                            )}

                            <circle
                              className="status"
                              cx="9.5"
                              cy="-9.5"
                              r="2.6"
                            />
                          </g>

                          <text
                            className="vlabel"
                            textAnchor="middle"
                            y="29"
                          >
                            {p.title}
                          </text>

                          {p.category && (
                            <text
                              className="vsub"
                              textAnchor="middle"
                              y="40"
                            >
                              {p.category}
                            </text>
                          )}
                        </a>
                      </g>
                    </g>
                  </g>
                )
              })}

              {techs.map((t, i) => {
                if (T_SLOTS[i][0] !== k) {
                  return null
                }

                const { x, y } = at(
                  rg.r,
                  T_SLOTS[i][1],
                )

                return (
                  <g
                    key={t}
                    transform={`translate(${x} ${y})`}
                    aria-hidden="true"
                  >
                    <g className="ctr">
                      <circle
                        className="tn"
                        r="3.4"
                      />

                      <text
                        className="tlabel"
                        textAnchor="middle"
                        y="16"
                      >
                        {t}
                      </text>
                    </g>
                  </g>
                )
              })}
            </g>
          </g>
        ))}

        <g aria-hidden="true">
          <circle
            className="core"
            r="14"
          />

          <text
            className="core-t"
            textAnchor="middle"
            y="3.5"
          >
            {initials}
          </text>
        </g>
      </svg>

      <p
        className="viz-tag tl"
        aria-hidden="true"
      >
        Project map
      </p>

      <p
        className="viz-tag bl"
        aria-hidden="true"
      >
        {list.length}{' '}
        {list.length === 1
          ? 'project'
          : 'projects'}
        {techs.length > 0 &&
          ` · ${techs.length} technologies`}
      </p>

      {pop && shown && (
        <div
          className="vz-pop"
          aria-hidden="true"
          data-show={
            pop.open || undefined
          }
          data-below={
            pop.y < 130 || undefined
          }
          style={{
            left: Math.min(
              Math.max(pop.x, 105),
              w - 105,
            ),
            top: pop.y,
          }}
        >
          {shown.category && (
            <p className="kicker">
              {shown.category}
            </p>
          )}

          <strong>
            {shown.title}
          </strong>

          <span className="go">
            View Project
            <ArrowUpRight />
          </span>
        </div>
      )}
    </div>
  )
}