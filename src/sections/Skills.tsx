import { Bot, Database, NotebookPen, Plug, ScanEye, Smartphone, type LucideIcon } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { content } from '../data/content'

const { sections, skills } = content

/**
 * Teknoloji logoları Devicon yazı tipinden gelir (index.html'de yüklenir).
 * `colored: false` olanlar (siyah logolar) temanın yazı rengini alır; Devicon'da olmayanlar için Lucide ikonu kullanılır.
 */
const logos: Record<string, { icon: string; colored?: boolean } | LucideIcon> = {
  Python: { icon: 'python-plain', colored: true },
  Java: { icon: 'java-plain', colored: true },
  C: { icon: 'c-plain', colored: true },
  'C++': { icon: 'cplusplus-plain', colored: true },
  'C#': { icon: 'csharp-plain', colored: true },
  PHP: { icon: 'php-plain', colored: true },
  JavaScript: { icon: 'javascript-plain', colored: true },
  SQL: Database,
  HTML: { icon: 'html5-plain', colored: true },
  CSS: { icon: 'css3-plain', colored: true },
  React: { icon: 'react-original', colored: true },
  'Next.js': { icon: 'nextjs-plain' },
  'React Native': { icon: 'react-original', colored: true },
  Expo: Smartphone,
  'Three.js': { icon: 'threejs-original' },
  'React Three Fiber': { icon: 'threejs-original' },
  MySQL: { icon: 'mysql-plain', colored: true },
  PostgreSQL: { icon: 'postgresql-plain', colored: true },
  Supabase: { icon: 'supabase-plain', colored: true },
  'REST API': Plug,
  OpenCV: { icon: 'opencv-plain', colored: true },
  'Qwen 3B VL': ScanEye,
  Claude: Bot,
  Git: { icon: 'git-plain', colored: true },
  GitHub: { icon: 'github-original' },
  'VS Code': { icon: 'vscode-plain', colored: true },
  Anaconda: { icon: 'anaconda-original', colored: true },
  Spyder: { icon: 'spyder-plain', colored: true },
  'Google Colab': NotebookPen,
  'Android Studio': { icon: 'androidstudio-plain', colored: true },
  Xcode: { icon: 'xcode-plain', colored: true },
  Unity: { icon: 'unity-plain' },
  TensorFlow: { icon: 'tensorflow-original', colored: true },
  PyTorch: { icon: 'pytorch-original', colored: true },
  'scikit-learn': { icon: 'scikitlearn-plain', colored: true },
}

function Logo({ name }: { name: string }) {
  const logo = logos[name]
  if (!logo) return <span aria-hidden="true" className="size-5" />
  if (typeof logo === 'object' && 'icon' in logo) {
    return <i aria-hidden="true" className={`devicon-${logo.icon} ${logo.colored ? 'colored' : 'text-fg'} text-xl leading-none`} />
  }
  const Icon = logo
  return <Icon size={20} aria-hidden="true" className="text-accent-2" />
}

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="skills-title"
          eyebrow={sections.skills.eyebrow}
          title={sections.skills.title}
          subtitle={sections.skills.subtitle}
        />

        <div>
          {skills.map((group, gi) => (
            <Reveal key={group.id} delay={gi * 0.05} className="rule grid grid-cols-1 gap-4 py-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8">
              <h3 className="font-mono text-xs tracking-[0.14em] text-muted uppercase md:pt-1.5">{group.title}</h3>
              <Stagger className="flex flex-wrap gap-x-7 gap-y-4">
                {group.items.map((skill) => (
                  <StaggerItem key={skill}>
                    <span className={`flex items-center gap-2.5 text-base font-medium ${group.learning ? 'text-muted' : 'text-fg'}`}>
                      <Logo name={skill} />
                      {skill}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
