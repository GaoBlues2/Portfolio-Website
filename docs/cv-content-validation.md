# CV-based content update

Source: Dao-Ngoc-Trung-TopCV.vn-151126.230602.pdf, supplied by the user.

Implemented Case Studies, Experience and About Me in `src/components/profile/WorldProfile.tsx`, with content separated in `src/data/profile.ts`.

- Four case studies: Pictor Network rendering, Rynus data workflows, IELTS AI feedback and 3S cloud render-farm management. Interactive areas explain CV-supported responsibilities; undocumented topology and numerical outcomes are not invented.
- Six employment entries, newest first, with the dates and responsibilities from the CV. Irender is included; Kite Learning, WEGOTT and 3S dates follow the CV rather than the earlier brief.
- About Me includes introduction, remote/AI interests, skills, education, sports and an email contact link. The precise home address and phone number are not copied into the page.
- Existing homepage miniatures and Projects chest remain in place.

Validation: production build passed; visually checked all three desktop sections; tested case selection, contribution selection, expandable employment details, skill selection, direct opening from the home cards, Escape and focus restoration. Browser error log was empty. At a measured 480 CSS-pixel viewport all three sections had no horizontal overflow. Reduced-motion handling is implemented, but browser emulation was not available. Build retains Node version and large 3D bundle warnings.
