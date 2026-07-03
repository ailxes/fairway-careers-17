-- Fairway Careers seed data: real golf-industry jobs researched 2026-07-03
-- Sources: TeamWork Online (PGA TOUR, Augusta National, Northern Texas PGA),
-- GCSAA Career Center, Trackman Careers, Arccos Careers, Topgolf Careers,
-- Foresight Sports, ZipRecruiter, Indeed, Lensa, FlexJobs, Career.com, Dayforce.

INSERT INTO public.jobs
  (title, employer, employer_slug, location, city, state, role_category, job_type,
   comp_min, comp_max, comp_notes, perks, description, apply_url, source, source_url,
   cool_score, cool_label, is_remote, tags, experience_level, status, is_featured, photo_url, posted_at)
VALUES
-- ============ PGA TOUR ============
('Senior Data Analyst, Media Analytics', 'PGA TOUR', 'pga-tour', 'Ponte Vedra Beach, FL', 'Ponte Vedra Beach', 'Florida', 'Media', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Sit at the intersection of golf and television, turning viewership and streaming data into decisions that shape how the TOUR is broadcast to millions. You will build audience models, benchmark media partners, and brief executives at golf''s most powerful organization. A rare data role where your dashboards influence what fans see on Sunday afternoons.',
 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-/senior-data-analyst-media-analytics-2178085', 'PGA TOUR Careers', 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-',
 84, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Specialist, Event Digital Marketing', 'PGA TOUR', 'pga-tour', 'Ponte Vedra Beach, FL', 'Ponte Vedra Beach', 'Florida', 'Marketing', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Run digital campaigns that put fans in the grandstands at PGA TOUR events across the country. You will manage email, paid social, and web content for tournament marketing from TOUR headquarters, steps from TPC Sawgrass. A strong first rung into big-league sports marketing.',
 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-/specialist-event-digital-marketing-2177368', 'PGA TOUR Careers', 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-',
 80, NULL, false, '{}', 'entry', 'live', false, NULL, now()),

('Junior Digital Designer', 'PGA TOUR', 'pga-tour', 'Ponte Vedra Beach, FL', 'Ponte Vedra Beach', 'Florida', 'Media', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Design graphics and digital creative that appear across PGA TOUR channels seen by millions of golf fans. Junior role on the in-house creative team producing social assets, web visuals, and campaign artwork. Build a huge portfolio fast while working next to golf''s biggest brand.',
 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-/junior-digital-designer-2171528', 'PGA TOUR Careers', 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-',
 82, NULL, false, '{}', 'entry', 'live', false, NULL, now()),

('Head of Business Development, PGA TOUR Studios', 'PGA TOUR', 'pga-tour', 'Ponte Vedra Beach, FL', 'Ponte Vedra Beach', 'Florida', 'Sales', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Lead commercial strategy for PGA TOUR Studios, the TOUR''s new content and production powerhouse. You will strike deals with streamers, brands, and media partners to grow golf storytelling worldwide. A senior seat at the table as golf media gets reinvented.',
 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-/head-of-business-development-pga-tour-studios-2173006', 'PGA TOUR Careers', 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-',
 91, NULL, false, '{}', 'senior', 'live', false, NULL, now()),

('Tournament Services & Pro-Am Internship (Simmons Bank Championship)', 'PGA TOUR', 'pga-tour', 'Little Rock, AR', 'Little Rock', 'Arkansas', 'Operations', 'Internship',
 NULL, NULL, NULL, '{}',
 'Work inside the ropes helping run a PGA TOUR Champions event, from pro-am pairings to player services. You will touch nearly every part of tournament week and leave with real event-ops experience and a TOUR network. The classic launchpad job for careers in professional golf.',
 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/simmons-bank-open-jobs/tournament-services-and-pro-am-internship-2155477', 'PGA TOUR Careers', 'https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-',
 78, NULL, false, ARRAY['internships','no-experience'], 'entry', 'live', false, NULL, now()),

-- ============ Augusta National ============
('Irrigation Technician', 'Augusta National Golf Club', 'augusta-national-golf-club', 'Augusta, GA', 'Augusta', 'Georgia', 'Agronomy', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Maintain the irrigation systems that keep the most famous turf in golf flawless. You will troubleshoot pumps, heads, and control systems on hallowed ground where every blade of grass is broadcast in April. Entry-level title, once-in-a-lifetime address.',
 'https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs/irrigation-technician-2174429', 'TeamWork Online', 'https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs',
 95, NULL, false, ARRAY['augusta-adjacent'], 'entry', 'live', false, NULL, now()),

('Senior Director, Horticulture', 'Augusta National Golf Club', 'augusta-national-golf-club', 'Augusta, GA', 'Augusta', 'Georgia', 'Agronomy', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Own the azaleas. This senior leadership role directs the horticulture program at Augusta National, where flowering plants are as iconic as the golf itself. You will lead the team behind the most photographed landscape in the sport and set the standard the entire industry copies.',
 'https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs/senior-director-horticulture-2173600', 'TeamWork Online', 'https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs',
 93, NULL, false, ARRAY['augusta-adjacent'], 'senior', 'live', false, NULL, now()),

('HR Administrative Assistant', 'Augusta National Golf Club', 'augusta-national-golf-club', 'Augusta, GA', 'Augusta', 'Georgia', 'Operations', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Support the people team at the club that hosts the Masters. Day to day you will handle scheduling, records, and onboarding for one of the most exclusive workplaces in sports. An entry-level door into an organization almost nobody gets to see from the inside.',
 'https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs/hr-administrative-assistant-2178178', 'TeamWork Online', 'https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs',
 85, NULL, false, ARRAY['augusta-adjacent','no-experience'], 'entry', 'live', false, NULL, now()),

-- ============ GCSAA Career Center (agronomy) ============
('Assistant Golf Course Superintendent', 'Army Navy Country Club', 'army-navy-country-club', 'Fairfax, VA', 'Fairfax', 'Virginia', 'Agronomy', 'Full-time',
 65000, NULL, NULL, '{}',
 'Help lead turf operations at a storied private club serving the DC military community. You will run crews, manage water and inputs, and prep championship-quality conditions just outside the capital. Strong pay and a clear path to a superintendent chair.',
 'https://careers.gcsaa.org/jobs/22398109/assistant-golf-course-superintendent', 'GCSAA Career Center', 'https://careers.gcsaa.org/jobs',
 74, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Golf Course Superintendent', 'TPC Scottsdale', 'tpc-scottsdale', 'Scottsdale, AZ', 'Scottsdale', 'Arizona', 'Agronomy', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Grow grass for the loudest show in golf. As superintendent at TPC Scottsdale you prepare the Stadium Course for the WM Phoenix Open and its half-million fans, then keep elite resort conditions the other 51 weeks. One of the highest-profile agronomy jobs in the country.',
 'https://careers.gcsaa.org/jobs/22392324/golf-course-superintendent', 'GCSAA Career Center', 'https://careers.gcsaa.org/jobs',
 92, NULL, false, ARRAY['augusta-adjacent'], 'senior', 'live', false, NULL, now()),

('Assistant in Training (AIT)', 'Bounty Club', 'bounty-club', 'Nashville, TN', 'Nashville', 'Tennessee', 'Agronomy', 'Full-time',
 NULL, NULL, NULL, '{}',
 'A build-your-career role at a brand-new Nashville club: learn greenkeeping from the ground up on a formal assistant-in-training track. No superintendent resume required, just work ethic and a love of being outside. Ideal first step into the turf profession.',
 'https://careers.gcsaa.org/jobs/22392553/assistant-in-training-ait', 'GCSAA Career Center', 'https://careers.gcsaa.org/jobs',
 76, NULL, false, ARRAY['no-experience'], 'entry', 'live', false, NULL, now()),

-- ============ Troon ============
('Assistant Golf Course Superintendent - The National at Ave Maria', 'Troon', 'troon', 'Ave Maria, FL', 'Ave Maria', 'Florida', 'Agronomy', 'Full-time',
 80000, 80000, NULL, '{}',
 'Troon-managed Gordon Lewis course in fast-growing southwest Florida is hiring a second-in-command for its turf team. You will manage warm-season grass, irrigation, and a year-round crew with the resources of the world''s largest club-management company behind you. Posted at a strong $80k for the role.',
 'https://www.ziprecruiter.com/c/Troon-Golf/Job/Assistant-Golf-Course-Superintendent/-in-Ave-Maria,FL?jid=768cdd9a4c7c416e', 'ZipRecruiter', 'https://www.ziprecruiter.com/c/Troon-Golf/Job/Assistant-Golf-Course-Superintendent/-in-Ave-Maria,FL?jid=768cdd9a4c7c416e',
 75, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Assistant Golf Professional - Riverton Pointe Golf & Country Club', 'Troon', 'troon', 'Hardeeville, SC', 'Hardeeville', 'South Carolina', 'Professional', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Classic PGA-track assistant pro job in the Hilton Head lowcountry: run tournaments, teach, and manage the shop at a Troon-operated club. You get corporate training, playing opportunities, and a proven ladder toward head-professional roles across 900+ Troon properties.',
 'https://www.ziprecruiter.com/co/troon-golf/Jobs/-in-Hardeeville,SC', 'ZipRecruiter', 'https://www.ziprecruiter.com/co/troon-golf/Jobs/-in-Hardeeville,SC',
 79, NULL, false, '{}', 'entry', 'live', false, NULL, now()),

-- ============ Trackman ============
('US Golf Simulator Installation Specialist', 'Trackman', 'trackman', 'Phoenix, AZ', 'Phoenix', 'Arizona', 'Operations', 'Full-time',
 NULL, NULL, NULL, ARRAY['travel'],
 'Fly around the country building Trackman simulator bays in homes, clubs, and venues, then hand customers the same technology tour pros use. Part construction, part AV tech, part customer hero, with heavy travel and hands-on problem solving. Great fit for tinkerers who want golf tech as a trade.',
 'https://careers.trackman.com/o/us-golf-simulator-installation-specialist-1', 'Trackman Careers', 'https://careers.trackman.com/',
 83, NULL, false, ARRAY['career-changers'], 'entry', 'live', false, NULL, now()),

('Range Sales Manager - Mid-East US', 'Trackman', 'trackman', NULL, NULL, NULL, 'Sales', 'Full-time',
 NULL, NULL, NULL, ARRAY['travel'],
 'Sell Trackman Range, the ball-tracking system transforming driving ranges into entertainment venues, across a multi-state Mid-East territory. Remote, field-based role meeting range owners, resorts, and universities. You carry the flagship product of golf''s dominant data company.',
 'https://careers.trackman.com/o/trackman-range-sales-manager-mid-east', 'Trackman Careers', 'https://careers.trackman.com/',
 80, NULL, true, '{}', 'mid', 'live', false, NULL, now()),

-- ============ Titleist / Acushnet ============
('Summer 2026 R&D Engineer Intern - Titleist Golf Clubs', 'Titleist', 'titleist', 'Carlsbad, CA', 'Carlsbad', 'California', 'Engineering', 'Internship',
 NULL, NULL, '$22-26/hr', '{}',
 'Spend a summer engineering the next generation of Titleist clubs in Carlsbad, with lab and field testing that can include work at the Titleist Performance Institute. You will run numerical analysis in MATLAB and Python, touch CAD and motion capture, and see how tour equipment actually gets made. Dream internship for golf-obsessed mechanical engineers.',
 'https://www.ziprecruiter.com/c/Acushnet-Holdings/Job/Summer-2026-R&D-Engineer-Intern-|-Titleist-Golf-Clubs/-in-Carlsbad,CA?jid=ebb6cae71cbcd869', 'ZipRecruiter', 'https://www.ziprecruiter.com/c/Acushnet-Holdings/Job/Summer-2026-R&D-Engineer-Intern-|-Titleist-Golf-Clubs/-in-Carlsbad,CA?jid=ebb6cae71cbcd869',
 90, NULL, false, ARRAY['internships','career-changers'], 'entry', 'live', false, NULL, now()),

('Principal Scientist, Golf Ball R&D', 'Titleist', 'titleist', 'Fairhaven, MA', 'Fairhaven', 'Massachusetts', 'Engineering', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Lead advanced research on the most played ball in golf. At Acushnet''s Fairhaven R&D campus you will design, model, and validate new golf ball constructions years before they reach the tour. Deep materials science meets a product half the field trusts every Sunday.',
 'https://www.indeed.com/q-acushnet-titleist-l-fairhaven,-ma-jobs.html', 'Indeed', 'https://www.indeed.com/q-acushnet-titleist-l-fairhaven,-ma-jobs.html',
 88, NULL, false, ARRAY['career-changers'], 'senior', 'live', false, NULL, now()),

-- ============ Foresight Sports ============
('Computer Vision Engineer', 'Foresight Sports', 'foresight-sports', 'San Diego, CA', 'San Diego', 'California', 'Engineering', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Build the camera-based ball and club tracking algorithms inside launch monitors used by major equipment makers and 80+ tour pros. C++, image processing, and machine learning applied to a product golfers geek out over. San Diego HQ, hardware you can actually hit golf balls at.',
 'https://www.foresightsports.com/careers', 'Foresight Careers', 'https://www.foresightsports.com/careers',
 87, NULL, false, ARRAY['career-changers'], 'mid', 'live', false, NULL, now()),

('Senior Electrical Engineer', 'Foresight Sports', 'foresight-sports', 'San Diego, CA', 'San Diego', 'California', 'Engineering', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Design the PCBs and electronics that power Foresight''s GC-series launch monitors and sim hardware. Senior role owning board design in Altium for high-speed camera systems that must survive garages, tour vans, and teaching studios alike. Ship hardware that shows up on driving ranges everywhere.',
 'https://www.foresightsports.com/careers', 'Foresight Careers', 'https://www.foresightsports.com/careers',
 84, NULL, false, ARRAY['career-changers'], 'senior', 'live', false, NULL, now()),

-- ============ Arccos Golf ============
('Staff/Senior Engineer, Platform Engineering', 'Arccos Golf', 'arccos-golf', 'Stamford, CT', 'Stamford', 'Connecticut', 'Engineering', 'Full-time',
 NULL, NULL, NULL, ARRAY['playing_privileges'],
 'Own cloud infrastructure at golf''s original AI shot-tracking company, whose sensors have logged over a billion shots. Small team, big data, and golf perks including green-fee subsidies. Your platform work directly powers the caddie advice in players'' pockets.',
 'https://www.arccosgolf.com/pages/staff-senior-engineer-platform-engineering', 'Arccos Careers', 'https://www.arccosgolf.com/pages/careers',
 85, NULL, false, ARRAY['career-changers'], 'senior', 'live', false, NULL, now()),

('Social Media Lead', 'Arccos Golf', 'arccos-golf', 'Stamford, CT', 'Stamford', 'Connecticut', 'Media', 'Full-time',
 NULL, NULL, NULL, ARRAY['playing_privileges'],
 'Run Meta, TikTok, YouTube, and LinkedIn for a data-obsessed golf brand, including real-time activations during PGA TOUR events. You will scout creators, shape the voice, and turn a billion shots of data into scroll-stopping content. Hybrid role with green-fee subsidies as a perk.',
 'https://www.arccosgolf.com/pages/social-media-lead', 'Arccos Careers', 'https://www.arccosgolf.com/pages/careers',
 86, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Partnerships Marketing Manager', 'Arccos Golf', 'arccos-golf', 'Stamford, CT', 'Stamford', 'Connecticut', 'Marketing', 'Full-time',
 NULL, NULL, NULL, ARRAY['playing_privileges'],
 'Scale co-marketing programs between Arccos and its equipment, retail, and tour partners. You will run campaigns that put smart-sensor golf tech in front of millions of players through some of the biggest brand names in the sport. High-leverage marketing seat at a category-defining startup.',
 'https://www.arccosgolf.com/pages/partnerships-marketing-manager', 'Arccos Careers', 'https://www.arccosgolf.com/pages/careers',
 81, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

-- ============ Golf media ============
('Lead Associate Producer, Golf Channel', 'Golf Channel (NBC Sports)', 'golf-channel', 'Orlando, FL', 'Orlando', 'Florida', 'Media', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Help produce features, documentaries, and digital content for the network that lives and breathes golf. You will chase B-roll and archival footage, support field shoots, and work tournament weekends from Golf Channel''s Orlando operation. A storytelling job inside golf television''s biggest newsroom.',
 'https://www.ziprecruiter.com/Jobs/Golf-Channel/-in-Orlando,FL', 'ZipRecruiter', 'https://www.ziprecruiter.com/Jobs/Golf-Channel/-in-Orlando,FL',
 87, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Social Media Manager', 'Fried Egg Golf', 'fried-egg-golf', NULL, NULL, NULL, 'Media', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Own the social presence of one of golf''s most beloved independent media brands, known for smart course-architecture takes and cult-favorite podcasts. Fully remote (Eastern or Central time zones), shaping content strategy across every major platform. Perfect for a golf sicko with a feel for internet culture.',
 'https://www.thefriedegg.com/articles/fried-egg-golf-social-media-manager-job-description', 'Fried Egg Golf', 'https://www.thefriedegg.com/articles/fried-egg-golf-social-media-manager-job-description',
 89, NULL, true, '{}', 'mid', 'live', false, NULL, now()),

-- ============ Golf software ============
('Customer Support Representative', 'Golf Genius Software', 'golf-genius-software', NULL, NULL, NULL, 'Operations', 'Full-time',
 NULL, 52000, NULL, '{}',
 'Help clubs and tournament directors run leagues, live scoring, and events on software used at 10,000+ courses in 60 countries. Fully remote anywhere in the US, with pay up to $52k and a support team stacked with PGA professionals. A genuine work-from-home job that is still 100% golf.',
 'https://www.flexjobs.com/remote-jobs/company/golf_genius_software', 'FlexJobs', 'https://www.flexjobs.com/remote-jobs/company/golf_genius_software',
 77, NULL, true, ARRAY['no-experience'], 'entry', 'live', false, NULL, now()),

-- ============ Instruction ============
('Certified Personal Coach', 'GOLFTEC', 'golftec', 'Novi, MI', 'Novi', 'Michigan', 'Instruction', 'Full-time',
 50000, 60000, NULL, ARRAY['pga_dues'],
 'Teach data-driven lessons in GOLFTEC''s tech-loaded training bays, with motion sensors and video on every swing. The company pays your way through GOLFTEC University and covers costs toward PGA certification, plus a signing bonus on graduation. Turn being the best golfer in your friend group into an actual salaried career.',
 'https://www.ziprecruiter.com/c/GOLFTEC/Job/Certified-Personal-Coach/-in-Novi,MI?jid=d92b19309b7f9282', 'ZipRecruiter', 'https://www.ziprecruiter.com/c/GOLFTEC/Job/Certified-Personal-Coach/-in-Novi,MI?jid=d92b19309b7f9282',
 82, NULL, false, ARRAY['career-changers'], 'entry', 'live', false, NULL, now()),

('Golf Coach', 'Five Iron Golf', 'five-iron-golf', 'Chicago, IL', 'Chicago', 'Illinois', 'Instruction', 'Full-time',
 NULL, NULL, '$40-70/hr incl. incentives', '{}',
 'Coach lessons on premium simulators at Five Iron''s downtown Chicago venue, where golf meets nightlife. Strong hourly plus incentive comp, a young clientele, and none of the 6am dew-sweeping of a traditional pro shop job. Requires 2+ years in golf or a PGM degree.',
 'https://www.ziprecruiter.com/c/Five-Iron-Golf/Job/Golf-Coach/-in-Chicago,IL?jid=1ca9deb03acd068b', 'ZipRecruiter', 'https://www.ziprecruiter.com/c/Five-Iron-Golf/Job/Golf-Coach/-in-Chicago,IL?jid=1ca9deb03acd068b',
 84, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Golf Instructor', 'Topgolf', 'topgolf', NULL, NULL, NULL, 'Instruction', 'Full-time',
 NULL, NULL, NULL, ARRAY['gear_discount'],
 'Make golf fun for total beginners through corporate groups at Topgolf venues nationwide, teaching with Toptracer ball tracking, multi-angle video, and Callaway equipment. Instructors rave about the relaxed vibe and work-life balance compared to club jobs. Openings roll across dozens of US venues.',
 'https://careers.topgolf.com/us/en/golf-instruction-careers', 'Topgolf Careers', 'https://careers.topgolf.com/us/en/golf-instruction-careers',
 80, NULL, false, '{}', 'entry', 'live', false, NULL, now()),

-- ============ Caddie programs ============
('Golf Caddie - Pebble Beach Golf Links', 'CaddieMaster', 'caddiemaster', 'Pebble Beach, CA', 'Pebble Beach', 'California', 'Caddie', 'Full-time',
 NULL, NULL, 'Up to ~$1,300/week (loops + tips)', '{}',
 'Loop the most famous public course in America, reading putts above Stillwater Cove where the U.S. Open returns in 2027. CaddieMaster hires outgoing people with basic golf knowledge; professional golf experience is not required. Get paid to walk Pebble Beach every day.',
 'https://www.career.com/job/caddiemaster/golf-caddie-pebble-beach/j202204262225245114577', 'Career.com', 'https://www.career.com/job/caddiemaster/golf-caddie-pebble-beach/j202204262225245114577',
 96, NULL, false, ARRAY['no-experience','augusta-adjacent'], 'entry', 'live', false, NULL, now()),

('Golf Caddie - Pinehurst Resort', 'CaddieMaster', 'caddiemaster', 'Pinehurst, NC', 'Pinehurst', 'North Carolina', 'Caddie', 'Full-time',
 NULL, NULL, '$800-$1,000+/week', '{}',
 'Carry at the cradle of American golf, including Pinehurst No. 2, anchor site of the U.S. Open. Flexible scheduling, $800-1,000+ per week, and training provided; hospitality or service backgrounds welcome. Few jobs put you closer to championship golf history.',
 'https://www.career.com/job/caddiemaster/golf-caddie-pinehurst-resort/j202204122219392030659', 'Career.com', 'https://www.career.com/job/caddiemaster/golf-caddie-pinehurst-resort/j202204122219392030659',
 92, NULL, false, ARRAY['no-experience','augusta-adjacent'], 'entry', 'live', false, NULL, now()),

('Golf Caddie', 'Bandon Dunes Golf Resort', 'bandon-dunes-golf-resort', 'Bandon, OR', 'Bandon', 'Oregon', 'Caddie', 'Seasonal',
 NULL, NULL, NULL, ARRAY['housing','playing_privileges'],
 'Caddie the wind-blown links of Bandon Dunes, the walking-only resort golfers pilgrimage to from all over the world. Discounted on-site housing is available and employees play the resort''s renowned courses for free. Live at the beach, loop world-top-100 golf, repeat.',
 'https://www.ziprecruiter.com/co/Bandon-Dunes-Golf-Resort/Jobs/Caddie?id=x6RjwmXeOxG02WffHxvvHkTejcU%3D', 'ZipRecruiter', 'https://www.ziprecruiter.com/co/Bandon-Dunes-Golf-Resort/Jobs/Caddie?id=x6RjwmXeOxG02WffHxvvHkTejcU%3D',
 95, NULL, false, ARRAY['no-experience'], 'entry', 'live', false, NULL, now()),

('Caddie - The Ocean Course', 'Kiawah Island Golf Resort', 'kiawah-island-golf-resort', 'Kiawah Island, SC', 'Kiawah Island', 'South Carolina', 'Caddie', 'Part-time',
 NULL, NULL, NULL, '{}',
 'Guide guests around the Ocean Course, the seaside monster that hosted the 2021 PGA Championship and the 1991 Ryder Cup. Basic golf knowledge and great people skills are the main requirements. Every loop comes with Atlantic views and major-championship stories.',
 'https://jobs.dayforcehcm.com/kiawah/CANDIDATEPORTAL/jobs/10190', 'Dayforce', 'https://jobs.dayforcehcm.com/kiawah/CANDIDATEPORTAL/jobs/10190',
 93, NULL, false, ARRAY['no-experience','augusta-adjacent'], 'entry', 'live', false, NULL, now()),

-- ============ Fitness ============
('Personal Trainer', 'Grey Oaks Country Club', 'grey-oaks-country-club', 'Naples, FL', 'Naples', 'Florida', 'Fitness', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Train members at a luxury Naples club whose wellness campus includes a dedicated Golf Performance Center with InRange technology. Blend evidence-based programming with golf-specific fitness for a clientele that takes both seriously. High-end country club fitness at its most golf-forward.',
 'https://www.indeed.com/viewjob?jk=0dcfc23fbcf0ad75', 'Indeed', 'https://www.indeed.com/viewjob?jk=0dcfc23fbcf0ad75',
 78, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Fitness Trainer', 'Invited (Quail Hollow Country Club - OH)', 'invited', 'Painesville, OH', 'Painesville', 'Ohio', 'Fitness', 'Part-time',
 NULL, NULL, NULL, '{}',
 'Coach members and design personal programs at an Invited-operated country club east of Cleveland. Invited runs 130+ private clubs nationwide, so strong trainers can grow into fitness leadership across the portfolio. Golf, tennis, and a built-in member clientele beat big-box gym floors.',
 'https://lensa.com/job-v1/invited-clubs/painesville-oh/fitness-trainer/8e592aa0395f67e91c75777432d0563a', 'Lensa', 'https://lensa.com/job-v1/invited-clubs/painesville-oh/fitness-trainer/8e592aa0395f67e91c75777432d0563a',
 72, NULL, false, '{}', 'entry', 'live', false, NULL, now()),

-- ============ Merchandising / retail ============
('Golf Shop Attendant - The Golf Club at Fox Acres', 'Landscapes Golf Management', 'landscapes-golf-management', 'Red Feather Lakes, CO', 'Red Feather Lakes', 'Colorado', 'Merchandising', 'Seasonal',
 NULL, NULL, '$14-16/hr', '{}',
 'Run the pro shop counter at a private mountain club tucked into the Colorado high country at 8,000 feet. You will merchandise apparel and equipment, book tee times, and be the friendly first face of the club. Seasonal gig with a scenery upgrade no mall retail job can match.',
 'https://www.ziprecruiter.com/Jobs/Golf-Shop', 'ZipRecruiter', 'https://www.ziprecruiter.com/Jobs/Golf-Shop',
 71, NULL, false, ARRAY['no-experience'], 'entry', 'live', false, NULL, now()),

('Performance Fitter', 'Callaway Golf', 'callaway-golf', 'Carlsbad, CA', 'Carlsbad', 'California', 'Sales', 'Part-time',
 NULL, NULL, NULL, ARRAY['gear_discount'],
 'Travel to fitting days and demo events fitting golfers into Callaway and Odyssey equipment with launch-monitor data. Part-time, varied schedule, and you become a walking encyclopedia of the newest gear before anyone else hits it. Ideal side gig for equipment nerds with people skills.',
 'https://www.glassdoor.com/job-listing/performance-fitter-callaway-JV_IC1147279_KO0,18_KE19,27.htm?jl=1009228517304', 'Glassdoor', 'https://www.glassdoor.com/job-listing/performance-fitter-callaway-JV_IC1147279_KO0,18_KE19,27.htm?jl=1009228517304',
 83, NULL, false, '{}', 'entry', 'live', false, NULL, now()),

-- ============ Hospitality ============
('Restaurant Server', 'Kiawah Island Golf Resort', 'kiawah-island-golf-resort', 'Kiawah Island, SC', 'Kiawah Island', 'South Carolina', 'Hospitality', 'Full-time',
 NULL, NULL, '$6.52/hr + tips', '{}',
 'Serve guests at a Forbes-level oceanfront resort built around five championship golf courses. Tipped role with resort perks and on-island privileges, steps from the Ocean Course. Hospitality experience here opens doors at luxury golf properties everywhere.',
 'https://www.ziprecruiter.com/co/kiawah-island-golf-resort/Jobs/-in-Kiawah-Island,SC', 'ZipRecruiter', 'https://www.ziprecruiter.com/co/kiawah-island-golf-resort/Jobs/-in-Kiawah-Island,SC',
 74, NULL, false, ARRAY['no-experience'], 'entry', 'live', false, NULL, now()),

-- ============ PGA of America ============
('PGA Jr. League Competitions Leader', 'PGA of America', 'pga-of-america', 'Frisco, TX', 'Frisco', 'Texas', 'Operations', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Run competitions for PGA Jr. League, the scrambles-format program introducing tens of thousands of kids to golf each year. Based at the PGA of America''s gleaming new Frisco headquarters beside Fields Ranch. Shape how the next generation falls in love with the game.',
 'https://pgahq.wd1.myworkdayjobs.com/PGAHQ', 'Glassdoor', 'https://www.glassdoor.com/Job/pga-of-america-Frisco-SRCH_KO0,14_IL.15,21_IC1139994.htm',
 81, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

('Education Faculty', 'PGA of America', 'pga-of-america', 'Frisco, TX', 'Frisco', 'Texas', 'Instruction', 'Full-time',
 54000, 80000, NULL, '{}',
 'Teach the teachers: deliver curriculum that trains PGA members and associates working toward membership. Faculty role at PGA Frisco combining golf knowledge, coaching science, and adult education. Your students go on to run golf at thousands of American facilities.',
 'https://pgahq.wd1.myworkdayjobs.com/PGAHQ', 'Glassdoor', 'https://www.glassdoor.com/Job/pga-of-america-Frisco-SRCH_KO0,14_IL.15,21_IC1139994.htm',
 79, NULL, false, '{}', 'mid', 'live', false, NULL, now()),

-- ============ Northern Texas PGA ============
('2026 Fall East Texas Junior Tour Tournament Operations Intern', 'Northern Texas PGA', 'northern-texas-pga', 'Tyler, TX', 'Tyler', 'Texas', 'Operations', 'Internship',
 NULL, NULL, NULL, ARRAY['travel'],
 'Set up courses, run scoring, and manage junior tour events across East Texas for one of the largest PGA sections in the country. Hands-on tournament administration with real responsibility from week one. NTPGA internships are a proven pipeline into golf-operations careers.',
 'https://www.teamworkonline.com/golf-tennis-jobs/northern-texas-pga/northern-tx-pga/2026-fall-east-texas-junior-tour-tournament-operations-2177790', 'TeamWork Online', 'https://www.teamworkonline.com/golf-tennis-jobs/northern-texas-pga/northern-tx-pga',
 75, NULL, false, ARRAY['internships','no-experience'], 'entry', 'live', false, NULL, now()),

('2026 Fall West Texas Junior Tournament Operations Intern', 'Northern Texas PGA', 'northern-texas-pga', 'Lubbock, TX', 'Lubbock', 'Texas', 'Operations', 'Internship',
 NULL, NULL, NULL, ARRAY['travel'],
 'Travel Lubbock, Amarillo, and Midland-Odessa running junior golf tournaments for the Northern Texas PGA section. You will handle rules, pace of play, scoring tech, and parents, which is its own kind of education. A resume-building fall for anyone eyeing tournament golf as a career.',
 'https://www.teamworkonline.com/golf-tennis-jobs/northern-texas-pga/northern-tx-pga/2026-fall-west-texas-junior-tournament-operations-intern-lubbock-amarillo-midland-odessa-northern-texas-pga-2177787', 'TeamWork Online', 'https://www.teamworkonline.com/golf-tennis-jobs/northern-texas-pga/northern-tx-pga',
 75, NULL, false, ARRAY['internships','no-experience'], 'entry', 'live', false, NULL, now()),

-- ============ Rapsodo ============
('Inside Sales Representative - Golf', 'Rapsodo', 'rapsodo', 'St. Louis, MO', 'St. Louis', 'Missouri', 'Sales', 'Full-time',
 NULL, NULL, NULL, '{}',
 'Sell Rapsodo''s portable launch monitors, the gateway drug of golf data for coaches and everyday players. St. Louis-based inside sales with warm inbound interest from a brand partnered with Golf Digest and the PGA of America. Talk ball flight all day and get paid for it.',
 'https://apply.workable.com/rapsodo/', 'LinkedIn Jobs', 'https://www.linkedin.com/jobs/rapsodo-jobs',
 76, NULL, false, '{}', 'entry', 'live', false, NULL, now());

-- =====================================================================
-- QUICK REFERENCE (one line per job)
-- =====================================================================
-- [84] Senior Data Analyst, Media Analytics @ PGA TOUR (Florida) https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-
-- [80] Specialist, Event Digital Marketing @ PGA TOUR (Florida) https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-
-- [82] Junior Digital Designer @ PGA TOUR (Florida) https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-
-- [91] Head of Business Development, PGA TOUR Studios @ PGA TOUR (Florida) https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-
-- [78] Tournament Services & Pro-Am Internship @ PGA TOUR (Arkansas) https://www.teamworkonline.com/golf-tennis-jobs/pgatour/pga-tour-
-- [95] Irrigation Technician @ Augusta National Golf Club (Georgia) https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs
-- [93] Senior Director, Horticulture @ Augusta National Golf Club (Georgia) https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs
-- [85] HR Administrative Assistant @ Augusta National Golf Club (Georgia) https://www.teamworkonline.com/golf-tennis-jobs/augusta-national/augusta-national-jobs
-- [74] Assistant Golf Course Superintendent @ Army Navy Country Club (Virginia) https://careers.gcsaa.org/jobs
-- [92] Golf Course Superintendent @ TPC Scottsdale (Arizona) https://careers.gcsaa.org/jobs
-- [76] Assistant in Training (AIT) @ Bounty Club (Tennessee) https://careers.gcsaa.org/jobs
-- [75] Asst Golf Course Superintendent - Ave Maria @ Troon (Florida) https://www.ziprecruiter.com/c/Troon-Golf/Job/Assistant-Golf-Course-Superintendent/-in-Ave-Maria,FL?jid=768cdd9a4c7c416e
-- [79] Assistant Golf Professional - Riverton Pointe @ Troon (South Carolina) https://www.ziprecruiter.com/co/troon-golf/Jobs/-in-Hardeeville,SC
-- [83] US Golf Simulator Installation Specialist @ Trackman (Arizona) https://careers.trackman.com/
-- [80] Range Sales Manager - Mid-East US @ Trackman (remote) https://careers.trackman.com/
-- [90] Summer 2026 R&D Engineer Intern @ Titleist (California) https://www.ziprecruiter.com/c/Acushnet-Holdings/Job/Summer-2026-R&D-Engineer-Intern-|-Titleist-Golf-Clubs/-in-Carlsbad,CA?jid=ebb6cae71cbcd869
-- [88] Principal Scientist, Golf Ball R&D @ Titleist (Massachusetts) https://www.indeed.com/q-acushnet-titleist-l-fairhaven,-ma-jobs.html
-- [87] Computer Vision Engineer @ Foresight Sports (California) https://www.foresightsports.com/careers
-- [84] Senior Electrical Engineer @ Foresight Sports (California) https://www.foresightsports.com/careers
-- [85] Staff/Senior Engineer, Platform Engineering @ Arccos Golf (Connecticut) https://www.arccosgolf.com/pages/careers
-- [86] Social Media Lead @ Arccos Golf (Connecticut) https://www.arccosgolf.com/pages/careers
-- [81] Partnerships Marketing Manager @ Arccos Golf (Connecticut) https://www.arccosgolf.com/pages/careers
-- [87] Lead Associate Producer @ Golf Channel/NBC Sports (Florida) https://www.ziprecruiter.com/Jobs/Golf-Channel/-in-Orlando,FL
-- [89] Social Media Manager @ Fried Egg Golf (remote) https://www.thefriedegg.com/articles/fried-egg-golf-social-media-manager-job-description
-- [77] Customer Support Representative @ Golf Genius Software (remote) https://www.flexjobs.com/remote-jobs/company/golf_genius_software
-- [82] Certified Personal Coach @ GOLFTEC (Michigan) https://www.ziprecruiter.com/c/GOLFTEC/Job/Certified-Personal-Coach/-in-Novi,MI?jid=d92b19309b7f9282
-- [84] Golf Coach @ Five Iron Golf (Illinois) https://www.ziprecruiter.com/c/Five-Iron-Golf/Job/Golf-Coach/-in-Chicago,IL?jid=1ca9deb03acd068b
-- [80] Golf Instructor @ Topgolf (nationwide venues) https://careers.topgolf.com/us/en/golf-instruction-careers
-- [96] Golf Caddie - Pebble Beach Golf Links @ CaddieMaster (California) https://www.career.com/job/caddiemaster/golf-caddie-pebble-beach/j202204262225245114577
-- [92] Golf Caddie - Pinehurst Resort @ CaddieMaster (North Carolina) https://www.career.com/job/caddiemaster/golf-caddie-pinehurst-resort/j202204122219392030659
-- [95] Golf Caddie @ Bandon Dunes Golf Resort (Oregon) https://www.ziprecruiter.com/co/Bandon-Dunes-Golf-Resort/Jobs/Caddie?id=x6RjwmXeOxG02WffHxvvHkTejcU%3D
-- [93] Caddie - The Ocean Course @ Kiawah Island Golf Resort (South Carolina) https://jobs.dayforcehcm.com/kiawah/CANDIDATEPORTAL/jobs/10190
-- [78] Personal Trainer @ Grey Oaks Country Club (Florida) https://www.indeed.com/viewjob?jk=0dcfc23fbcf0ad75
-- [72] Fitness Trainer @ Invited (Ohio) https://lensa.com/job-v1/invited-clubs/painesville-oh/fitness-trainer/8e592aa0395f67e91c75777432d0563a
-- [71] Golf Shop Attendant - Fox Acres @ Landscapes Golf Management (Colorado) https://www.ziprecruiter.com/Jobs/Golf-Shop
-- [83] Performance Fitter @ Callaway Golf (California) https://www.glassdoor.com/job-listing/performance-fitter-callaway-JV_IC1147279_KO0,18_KE19,27.htm?jl=1009228517304
-- [74] Restaurant Server @ Kiawah Island Golf Resort (South Carolina) https://www.ziprecruiter.com/co/kiawah-island-golf-resort/Jobs/-in-Kiawah-Island,SC
-- [81] PGA Jr. League Competitions Leader @ PGA of America (Texas) https://www.glassdoor.com/Job/pga-of-america-Frisco-SRCH_KO0,14_IL.15,21_IC1139994.htm
-- [79] Education Faculty @ PGA of America (Texas) https://www.glassdoor.com/Job/pga-of-america-Frisco-SRCH_KO0,14_IL.15,21_IC1139994.htm
-- [75] 2026 Fall East Texas Junior Tour Tournament Ops Intern @ Northern Texas PGA (Texas) https://www.teamworkonline.com/golf-tennis-jobs/northern-texas-pga/northern-tx-pga
-- [75] 2026 Fall West Texas Junior Tournament Ops Intern @ Northern Texas PGA (Texas) https://www.teamworkonline.com/golf-tennis-jobs/northern-texas-pga/northern-tx-pga
-- [76] Inside Sales Representative - Golf @ Rapsodo (Missouri) https://www.linkedin.com/jobs/rapsodo-jobs
