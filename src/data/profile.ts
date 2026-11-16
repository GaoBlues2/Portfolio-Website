// Source: the user's CV, supplied 15 November 2026. Public-facing English paraphrases.
// Keep exact employment dates; do not infer metrics, undocumented architectures or ownership.
export const profile = {
 name: 'Đào Ngọc Trung', displayName: 'Trung Dao', role: 'Full-stack Developer',
 location: 'Hanoi, Vietnam', email: 'ethanftd@gmail.com',
 introduction: 'I’m Trung Dao, a full-stack developer based in Hanoi, Vietnam, with over six years of experience building web, mobile and desktop applications.',
 approach: 'I’m looking for remote opportunities where I can research and develop AI products. I value autonomy, product quality and solving practical problems.',
 education: {degree: 'Information Technology',school:'Trường Đại học Thông tin Liên lạc Nha Trang',period:'2015 — 2019',detail:'University degree · Graduation classification: Good'},
 interests: ['Swimming', 'Badminton', 'Football', 'Running'],
}
export const experience = [
 {id:'pictor',company:'Pictor Lab',role:'Full-stack Developer',period:'Dec 2025 — Present',current:true,summary:'Distributed rendering, GPU infrastructure and cross-platform remote gaming.',projects:['Pictor Network','GPU4AI','Pyra.gg'],contributions:[
 'Develop Pictor Network, a distributed rendering platform with blockchain integration.',
 'Build rendering backends with job queues, automatic retries and progress tracking.',
 'Develop GPU4AI, a GPU rental platform for AI and compute workloads.',
 'Build automated AI server provisioning with a preinstalled OpenClaw environment.',
 'Develop resource, user and payment management features.',
 'Contribute bug fixes, maintenance and new features to Pyra.gg, including payments and Android, iOS and desktop packaging.',
 ]},
 {id:'irender',company:'Irender',role:'Full-stack Developer',period:'Sep 2024 — Nov 2025',current:false,summary:'AI data infrastructure, labeling tools and task-based Telegram experiences.',projects:['Rynus','Data Labeling','Telegram Mini App'],contributions:[
 'Contributed to Rynus, a Web3 project focused on AI data infrastructure.',
 'Built data-labeling tools for data processing and AI training.',
 'Developed a Telegram Mini App where users complete tasks and receive rewards.',
 'Built backend task distribution, workload management and real-time reward updates.',
 'Developed APIs and user interfaces, improving performance and usability.',
 ]},
 {id:'kite',company:'Kite Learning',role:'Full-stack Developer',period:'May 2024 — Aug 2024',current:false,summary:'IELTS practice across web and Flutter mobile applications, with AI feedback.',projects:['IELTS preparation platform'],contributions:[
 'Developed an IELTS preparation platform for the web and Flutter mobile applications.',
 'Integrated the OpenAI API for automated Writing and Speaking scoring and feedback.',
 'Built student management, learning-content management and personalized learning paths.',
 'Improved the interface and user experience.',
 ]},
 {id:'wegott',company:'WEGOTT',role:'Full-stack Developer',period:'May 2023 — Apr 2024',current:false,summary:'Internal business applications across backend, frontend and database layers.',projects:['Internal web systems'],contributions:[
 'Developed internal web systems to support business operations.',
 'Built and maintained both backend and frontend applications.',
 'Optimized database queries and API performance.',
 ]},
 {id:'3s',company:'3S Cloud Render Farm',role:'Full-stack Developer',period:'Aug 2020 — Apr 2023',current:false,summary:'Cloud render-farm management and AWS infrastructure integrations.',projects:['Cloud render-farm management'],contributions:[
 'Developed a cloud-based render-farm management system.',
 'Worked with AWS EC2, S3, Networking and Auto Scaling.',
 'Optimized render-task distribution and server resource management.',
 'Built interfaces for status monitoring and system administration.',
 ]},
 {id:'superrender',company:'Superrender Farm',role:'Web Developer',period:'Nov 2019 — May 2020',current:false,summary:'Web application development with Laravel and Vue.js.',projects:['Render-farm web applications'],contributions:[
 'Developed website features using Laravel and Vue.js.',
 'Contributed to backend and frontend development and maintenance.',
 ]},
]
export const skills = [
 {name:'Backend',symbol:'{ }',description:'APIs, real-time communication and background work.',items:['PHP / Laravel','Node.js / Express / NestJS','RESTful APIs','WebSocket','Queue systems'],connection:'Applied to render-job processing at Pictor Lab and task distribution at Irender.'},
 {name:'Frontend',symbol:'</>',description:'Interfaces for products, operations and learning.',items:['React','Vue.js','HTML / CSS','JavaScript ES6+'],connection:'Work spans internal business systems, monitoring interfaces and learning experiences.'},
 {name:'Data',symbol:'[ ]',description:'Relational databases, caching and query optimization.',items:['MySQL','PostgreSQL','Redis'],connection:'Database query and API performance optimization were part of my work at WEGOTT.'},
 {name:'Cloud & DevOps',symbol:'↗',description:'Cloud resources and application delivery.',items:['AWS EC2 / S3 / Networking','Auto Scaling','Docker','Linux / Ubuntu','CI/CD'],connection:'Worked with AWS services at 3S Cloud Render Farm and AI server provisioning at Pictor Lab.'},
 {name:'Mobile & AI',symbol:'✳',description:'Cross-platform experiences and AI integrations.',items:['Flutter','OpenAI API','Android / iOS / desktop packaging'],connection:'Built Flutter IELTS experiences at Kite Learning and packaged Pyra.gg across platforms at Pictor Lab.'},
]
export const caseStudies = [
 {id:'rendering',number:'01',title:'Coordinating distributed rendering',company:'Pictor Lab',period:'Dec 2025 — Present',category:'DISTRIBUTED SYSTEMS',intro:'Pictor Network is a distributed rendering platform with blockchain integration. My work focuses on the backend that manages rendering tasks and their execution.',context:'Rendering work needs to be queued, monitored and retried when execution fails.',responsibility:'Develop the rendering backend, including job processing, queue management, automatic retries and progress tracking.',areas:[
 {name:'Job processing',text:'Backend handling for rendering tasks in Pictor Network.'},
 {name:'Queues',text:'Queue management to organize rendering work.'},
 {name:'Retries',text:'Automatic reruns when a rendering task fails.'},
 {name:'Progress',text:'Progress tracking to make task execution visible.'},
 ],related:'At the same employer, I also develop GPU4AI, automated AI server provisioning with OpenClaw, and resource, user and payment management.',technologies:['Rendering backends','Queue management','Blockchain integration'],scope:'Contribution overview. Internal topology, retry policies and performance measurements are not disclosed in the CV.'},
 {id:'ai-data',number:'02',title:'Turning AI data work into tasks',company:'Irender',period:'Sep 2024 — Nov 2025',category:'AI DATA / WEB3',intro:'Rynus is a Web3 project focused on AI data infrastructure. My contributions included data-labeling tools and a Telegram Mini App for completing tasks and earning rewards.',context:'The product combines data work, task distribution, workload management and real-time reward updates.',responsibility:'Build data-labeling tools, backend task distribution, APIs and user interfaces, and develop the Telegram Mini App.',areas:[
 {name:'Data labeling',text:'Tools to support data processing and training AI models.'},
 {name:'Task distribution',text:'Backend features for distributing tasks and managing workloads.'},
 {name:'Mini App',text:'A Telegram experience where users complete tasks and receive rewards.'},
 {name:'Reward updates',text:'Real-time updates to reward points as part of the task experience.'},
 ],related:'My work also included improvements to API performance, interfaces and usability.',technologies:['Telegram Mini App','APIs','Data-labeling tools','Web3'],scope:'Contribution overview. Reward rules, data-validation methods and measured performance changes are not specified in the CV.'},
 {id:'ielts',number:'03',title:'Bringing AI feedback to IELTS practice',company:'Kite Learning',period:'May 2024 — Aug 2024',category:'EDTECH / APPLIED AI',intro:'An IELTS preparation platform delivered through a website and Flutter mobile applications, with automated feedback for Writing and Speaking.',context:'The learning experience brings together practice content, student management, personalized learning paths and feedback.',responsibility:'Develop the web and mobile platform and integrate the OpenAI API for automated scoring and feedback.',areas:[
 {name:'Practice',text:'IELTS preparation experiences on the website and Flutter mobile applications.'},
 {name:'AI feedback',text:'OpenAI API integration for scoring and commenting on Writing and Speaking work.'},
 {name:'Learning paths',text:'Student and learning-content management with personalized learning paths.'},
 {name:'User experience',text:'Interface and usability improvements across the learning experience.'},
 ],related:'The contribution spans both the learner-facing experience and the tools for managing students and content.',technologies:['Flutter','OpenAI API','Web applications'],scope:'Contribution overview. Prompt design, scoring validation and assessment accuracy are not specified in the CV.'},
 {id:'cloud',number:'04',title:'Managing a cloud render farm',company:'3S Cloud Render Farm',period:'Aug 2020 — Apr 2023',category:'CLOUD INFRASTRUCTURE',intro:'A cloud-based render-farm management system connecting rendering operations, server resources and monitoring interfaces.',context:'The work covers task distribution, resource management and visibility into system status.',responsibility:'Develop render-farm management features, work with AWS services, optimize task distribution and build monitoring interfaces.',areas:[
 {name:'Render tasks',text:'Optimized the distribution of rendering tasks.'},
 {name:'AWS resources',text:'Worked with EC2, S3, Networking and Auto Scaling.'},
 {name:'Server management',text:'Optimized management of server resources for the render farm.'},
 {name:'Monitoring',text:'Built interfaces for tracking status and administering the system.'},
 ],related:'This role combined full-stack application development with cloud infrastructure integrations.',technologies:['AWS EC2','S3','Networking','Auto Scaling'],scope:'Contribution overview. Deployment topology, scaling policies and numerical outcomes are not specified in the CV.'},
]
