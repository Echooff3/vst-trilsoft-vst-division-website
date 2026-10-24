/* Bruno's window (1100×736), redrawn on a canvas from the plug-in's own
   drawing code (vst-bruno src/editor.rs and src/theme.rs, egui): the same
   rectangles, colours, typefaces and widgets, so the /bruno tour and the
   homepage teaser show the plug-in as it is.

     const win = BrunoWindow(host, { base: '/' });
     win.draw(state)      state: see BASE below; time and pos drive the motion
     win.rect('pad')      a control's rectangle in window pixels, [x, y, w, h]

   The mood pad's dots are the real ones: where each groove of each
   section sits in the built-in bank (x anger, y fancy). */
(function (G) {
'use strict';
const W = 1100, H = 736;
const INK = '#1c1512', PAPER = '#f6eacf', PAPER_DARK = '#e2cd9f', RED = '#b5322a', RED_DARK = '#7a1f1a',
  MUSTARD = '#e0a526', ORANGE = '#e87828', TEAL = '#3f7f7a', TEAL_DARK = '#244e4a', WHITE = '#ffffff';
const TAU = Math.PI * 2, PI = Math.PI;

const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const alpha = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
const mix = (c, d, t) => { const A = hex(c), B = hex(d); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
const frac = x => x - Math.floor(x);

// egui sizes a font by its ascent-to-descent height; CSS by the em. k turns
// one into the other, ar puts the baseline where egui does.
const FONTS = {
  rye: { fam: 'BrunoRye', file: 'Rye-Regular.ttf', k: 2048 / 2560, ar: 2020 / 2560 },
  titan: { fam: 'BrunoTitan', file: 'TitanOne-Regular.ttf', k: 1000 / 1145, ar: 970 / 1145 },
  comic: { fam: 'BrunoComic', file: 'ComicNeue-Bold.ttf', k: 1000 / 1150, ar: 900 / 1150 },
};

// Where each groove of each section sits on the pad, from bank/bruno.bank:
// x then y, two base-36 digits each, over 1295.
const DOTS = {"INTRO": "mhp0bqqradsasmuzpitze6tdcat4mwzintp3ayqhaeqisryqq3rpa5qlaaqmursfosrgebt6a8qotjy0ohrqcct8fitet1wkcfr3btnobvnruhuckpu1avthgxvbw2xfr2u4byr49ktithwtrbstq8u8qfw7wbv3dj7scx8jdi9hehazej7temcwf1a0bz90f5amdc9idt92ggf0dp8kk9j8fn81eu6cfl8mh2b2ha9ki59mjje6g5cfh7bvfq7ufta6f48ohd8pg9a8fv8rgv9ng3eoe4bxhk8thnaphpa9enbkhgejgca3i0ns69t15zmq6rmskhmf2xup5jp67hgvhsnt44vd2cuq6ujbk4nw6fut5wqvl09uiflrl2sok8tkl5dsicq30vs3ov72mc59eeq52puu09tulyg9npsp33p826ojbhghhtq712pwqi7jn1b8dmjd46rh64pagzt9jwq83suvisqdsfc2k0jf2zsi8gqyf9pri7pe4dmu4kl4m3htjkjh40m86xrn78dkm7ita1h8czmc9zjvnjhj5ulx5nhahjdilthk8rki73klrol7ktfr72o87zo97dagmlgz8xkm6oknp9g7kyiv9hek7gfm4nqblke97yhc6kfncwgoojhn83kq7sjnjsd7lpft8oe07kkrd5cyklfv8aji7whd9924s9g0nohwr6hxo9eas7hys2i1nfi2mydnsbg2n2i5rqi6magltef5nmkzn6g4r4dov2j2tboeutlfsyinv4lhvoofrwlit4ipzwx3xty6zvy8xkvyzzxrxyz5xrx5zpv7dxpmi2q0dfm4e0rxijple9m6kvr776ho82nc8nos8ke18snf8ifwpqcjs5jqhwlcgfkvikixg0hfian1fymhiyo4giouipppgphqivnxglowiowngtmjt9irtuphrlngs0rtrunjrfrurynkrsnnj9nacsdb1lco22cq2ncs2gpy3bjx41jz5gk06hk37uk49dk6ajk8pce2oe7lpw8vq74f8c26qq54qu5y942krg557c1ipu6xpy0zmt28kd0moq44am45mp828v2apl3jny2oo435qy3mst5moo3nn96flg0poz12qgdenc2dmd2tlc1kp513pe4vpr14hx3ap017qmefb4grd9x94s4hc3vz4v369wui6mqzp4trna2w4wb34x4i50cb514k53fiu5onbc83j8zybk86d2c4rjsxbl00554mj5zz49b5j2vh5q6hl8vk564nswys7no0qxly9uoolmlq7po1h3ii9nvub7j1es8agq5zch5cew96fc7bbo624jd5cp6kfe63c67cdb98dn8ba46ycnbbbf99b97fck3oeq2qd66te2n5f88xg8n7hb7x1uk93mkc6ckd9bke39ia36f85cib59f986ic87faarifapfd00403o4q5h4r", "GROOVE": "cfenieg7jxhgn7pdodsceaeoj9kpk1t8dxkgikkqd14oiri9mll2m3umek7hfhhag39heh7jj2krex8oq4xsdwrqf97kb44ofq5pf5qohlmpdc7kdb4qjjneont8kwe6e0hbnfxjlotvfn7lghkrkgngkzqvez4agm6mcp1gkck5d66oi7dtee54di3bcu1ve99ren55dv8ejvhqez4bf86pc32jf03bg5gpg0emgqj2fh73f12kitiabm8pde9slrbxiyaqojezobm2jigdjxgdjrgfl8knjzggjsghjeghj0gijfarlbjruhqvkdfapjmxmajst5ovlyjuuyqplcjvr8myofivtbowr7losbmhokiwqymymbjvpen0lqjwtnstornim8p9j1jxnnift9q5hk4dgff3ca4roobfbq55c14skjfah8hsisg8kliacnjig2ewj8g8i68rppq2gi9igbg9cp4scsm2co6qe4cxbi6qbq7nkqbqh2e9oul5ct6ric42cd5vlud2ewm3ale0i1d2b791feaac6kzi2d9dodvbl6tda4uhtbcl9j6bo5wnamcgbd3in82bd3cbt44nkp1ptazqtq9oio5omo5l7t1rdr1o5o6qmp0h6ohr4pinvo8nwo8gvoipzrlodo9ntoajuuhqzr2mtobmuoblvt2owq9r1qzmjnnmpqbn7pilhodp1nvm2oeo9nkuvrntuqctjqdtzqdu3s5umrntkqfqkron2oelzofnrujn9n9l5j8hoighjbyhfiihxfliaiigkfmi0ijj4fnigikjbfwhhimj5fpiiimkufymqnah7inltdvkrhpfnu5mgv9jii1jqhlknj9ltlrgci2nbojo2jfnjlto0iykalfkmfzn2mjinoqq8u9lij0phoxe2jhkhnoclqmfcnjkzlxk3gyifj0lmo0dwedqfjdpifppvfqpdeor2lumkbzpljaqoj1br32d99u941hfa4v8t12a3c17gk39w5wgzfr9645jh8f7c3ek9c1989vgt73jm8f6b3fjac26m3fkpc37n3gq0a88y56ibc36x3ik4c4a058j6c68j3i6r59dy8g503jmoee6d59a86h5d2l7s83ejio5r5yebio5u5zekeq5e3k8f5agu7c733mhu8i8r45hsbr9qdes3nf715cbuft5a3mcyfc6o5cdkfdpqr1mcdjed2lg82nozlzck2odr1xg4gre87yf42os11hho87g42pgogrevcohacaoe1icx2qbg1yqrpzh6asfi3nh42sm4djdi1yjs7zhkaues2sef1zscswh15dhc83jo89s2pjer2tmxmjuepqu9prraiphbcoh32u64cs2jj44o21gygy2x7d32bc4s213fpe3t5p4n8j3w8j3ebf6g2uc4nbahh7bxb4ohrk7fcpaakd8mc75sdkacl9ag4vi7eh63ru8cc77jsr3mjof3irhqhjlfsvc8mkhytdfefemftzasfedtlheidne6ejgpfgg9mp33hn1ymq21hc00ms1crw2cjxaiuq0sfh1kpt1gfh92wo13kw1frg24mtivk5fjk3fy22f4rpfv81ft23f8glemn3flnweoacgx8kgdzz8xs09wht82uccznxllrgbpml4eny5jfiaub57osj9r5qijradgdm83mt6fr6hbjnfrgbfwgcdskhjwpahfjnixh8grq3jdkenim4eq7fmspwlgjzmhm6iofjnsoxnejelxk0nmkvlggtlpnjp6q7k6isktnchwgxjnl7sx5zqbhhrp60myhtte9aird5kwbgo1qudj4wd24xmn8rn08sti7nq28tpm7os6b75l858c9j3y627bdi72ad9n8t9a9j768v48ae9hdg9uk9b5qt7un67qe1587444pm8pixbhi3e1i34xfzdpe23icfaphutqisk09ks03otv4zsgi0mce6t86itw5rk5cfr3cysmdrqi6iqib76i9m8kcbgle2xiouzmouzzpdyar7x7r8ydr8zhpp9olb8th36qjab8md7hg395b87tkid5mf9ikjbklb7ylca1pu5pjj77ld82klb3qqbz7piwjkq7g3sfkcmu92qhjbt2l3cjitnyh4o6hwld3orpaesmebmdbhl43tyxo2bbhdbyf04z63fzav7k0madbh4v0ma99vcwjq9ff4ambicbgkayhd8apy6lli9k94mw2wn14dim63ck2xvd5sssd5i3249scl91946x643kcg9o959zbrk66ti565q9bks9ern58wki9ers8xrn6ui9daqd13s51kov65sjblpyagqv4efmaykv1kb2f1p0w2nf67m8469mqipaicke24sv8xra7q990qpc6vpwahd396vfkzrl8ms126oqeuujguoa2yrc7ano2ylybl6vah69gm6cjk7dml5cf6bff665gmavef8bfu77bman9ne5n25vaiaj7q8x3p8wpn7w4z8n146z489600dn6x6i0z786xar3rb7g47h1da0509d6k7z6y8id662avnc4f5m5e9vaj9eh6hguy6ualm1tu60l45q2a7p9w5z7sa47t86lu9je98kala59x557t6t9nc2b95ych4r6z539xggch67am3p5g7a9o7y7u5h6z5sboa5an54e4m6evo8i7k9erlkdysig5qldbuwdcngcyfudfy4qxu7hwn669dfdpcga0q527rwkmruanp88yts7wtd7xv551vihxv9dwtxcj", "UPBEAT": "bq5m9837di6thqedf36u8ybgblg72fhcen6vbr39ea6xfq9fa53a95bh2qamg79ha83bbi83ed6ya93cc26zeo71bc3e8f21d3fpd15nal3fdn7kig5gf67lez5hckdehwb2gp8jf04jg2cgj6icdj72ace6ds4rfwf4gye0cj4kb23glp1kef73b93if9che90jdw5p9m3jb085e1dvgc8k99dx7l4ss7mbqpjkqqjmqrlis9mcqtlkqujnsymdrnllt0mfvbo6t1mgrojorpjqs2u9njjrnkjswyuux7mhwbjuwckyr6mjnmlmnnjvq5mkoro8nojwwou1samlnpjxnrjznszls0uantk0nvk1nwlonxk3nyk4o0k5sxmnrqlpt2motsptsrpersj0uprsoso9oqoax0u3tjmpqvk6qxk8qlk9qykaqzkcr1kdthxgir7nicb3hpeqiefqhc86fjeri0c696a0d287gib4dx894succ8e1ggb5cp8a5v6gnapgcws06oh6ohlzo8ee6rh76gdap3zej98bht6hh46iklb7in8chb6khh6lejdi4h8e4qn37zdjgv925g943xcb4ka5g9cckmftfmash85idtoeive2gqcdh6j924fhmn95mf6mmwf6n2itlfbrk56onih1hubiijbkhkf9ik8fkadkkgijoxhfmkh8pnqooviwn3pwn6pylxvrn0q3p6m6pjq4o9kzo1oxpgq5mjx6q4svjwulk0q7jntohfsskntzjuvhfpppjvqpfeuqh1scfzseb7p8czke7spzcqumdmruc4sf91tj8gx37ts5dgkgftkugko092p983patdjbp1j27ow3jdphfnqvq0spgowteeqftzwwessgc7v09ww1ewt1m4lvjrsnjjq8lvt5m1klibozi7pqx5r3ujn6v5n7wptnvmn9vpnavyrkwsv8vto2wlr6viqzwjv3v8omxmp3uqx0z8piyinbyhnczzqkyrneynnfz0tqyzxexapjuyo4v4ngvloqvvvkv2nivrnjrdqrxirjuwnkvhnmvorlw4yfvgnnvxnou3qgs6npsenrxsqlvfplsbnsskntutrqruo5sgnvsizzx6ouv0oow1nwvzrnf5dme4efcfava3pucudnbgeaca9kagi3dvcsbmi9ehctahhsj1ho8j9m8pii74my5yin6mc39bl26vex63fdjfgx6qgh4uoi7hgpawg85sen89ip45kw8rgq73je6bjf7ksjazgd76rgb5msg3woialbchixe5bzd5t99om19vezamlfayso6hmu8sqbgfgr8ng99zp5cbgz5jlrfykiclfvctn09uiocoiadoi0c3kp1hl74el32lth49lc7pif41g31yoj5eay00s922cy2gj63ii21qe83wn51vf13ydol5d7714ub83k7a22a03mbz4vbv3n9j23ai4wcd3o8m24joeida418c26a4278x4xau3p8k28fv7tae9iexcjodapaq2u9x3r772aanaibd8mbu3s9h2b86cu9d96aj3t7c2cj474b45q7w2d8a2fe8789q3v8e2gki8ggd4z6y2h8v9sev42j0ejdb449aa19s8ngr7okh7p62ds9f50a63w7j2jkddfad51er4m9k2kdf7abp3x6z2lem45dp4n7y2n87fefd1pcy5uby009n14ku15fr0llb9uk66poz01on5vne03li46u5d1n95wp90mp58vucd2oe5yoj0nnb2oq71lm704q268py6q8t58598p5d1q4d48itfy518r6d2w7gcofhfz485zbk536i9882544nbp7b99i28wnfg0faa8g01mf89vjm49kvevix4afi69jibxg5a9dy0pe2c1dc19d965as05lmhhmp5rja2pkr2qldbmi50qi660gm06eq2xpvdwhn62im0rlk9aq8d3hj63is0sl09b", "THRASH": "56mh4kib3shfc1fg40ic4eie1k6gjwok3pii68ob2ccyj2od44ij3vji19naiol4bgov7oi63oe2j5hk8opm9do24vkjqovg5vs13gnknaooptww5sto4dvr0lgtm3sk36rw4usnh7fzk6vh3axb4bgr2zn653mj49tn32jue0qg5umk4hif2hngb7p0r8j1q4joo1i1q0mopcr8oudinxcstmuusvsfu9souaspw6w1s6s6tzu0tosru4v2u5ssuuv3vbu9vhuatuy1vfvluhw4vvx2vtv4ues3uwtru1zjuny5twstvduyt1viucumu8tjznrqzzsvzrsvyww6zeuczcswzusxpgwuulv5vpvmv3v7upxatqymuty6z0zlujud00uieve4byktcfe5h2py9r4qag9a9i8mi5hu7u2c992d8i2fb377851v8j2g8a2h872j9x4ha45ha05ias71smsysst0sot1sjrst5v8snt2t4uexys9esg0989qaa9r909sb0g28v9u8m89hqe6dy7c833wdb10bq72co12ai2o9uf0e90gck4vbm13cg4wd214br4x8w0hmw5jn5kzmk37m15yki4im61zn79fnb41li4zmq15m75zn617jk60lm0i0sinfd39av9kb93wg4lcdx18c2gc9n450uc7dm3afad9ct19eocnch1bgv48aq8n0v6k8y73hdpt6z1bedjb5n1cejcj2u0j7fgd732p781d819v3n1f6t9w9hj61dkhcp2ql2mcg29halc6e83bcw507lm6js62ez9xg83cgx51fv3eek63embqjh00lzh8ly0lofi3ky1gnmckk92soa3fo5clmu3gmc53nj3ijn54o27dkpl8q582l9iknrh3464jmyld5mjep56hnigz3wbzloip4z6xfnh13cjql83jd5giayctcq2kapchczdjbt8ocu85dkdkbxf5bl8p86bpeedmbhiwcb4k08e16vdv6g8r5q8sd1o48r7o51gf624mf6lzc7f6dslpe5fherdnbp8tc88v157yl7f8lc8wklf9odkvirc1kmfalr5l1t7zmlk34xmu4wmx3ijv4ng858j959jz9bqre4i7c38xcd5mhb78cl8yc490cc5n1ukwp1doqff1qi5nqr9bpzfcqk91hlj4fhe8dr9zdwa0gpq4gre9dea1dfa3fueadpa4cxa5ghm3gkebdga6d7a895gu6yfl72fmjfkq9zhl65fn5yfpnees5jcw5cfq5gfr7jhn4qft6ffujdhwl3k5dta9g9eufieddnaad3acmfp4j9hqktk6d9adibhwg0eedcaedaagkcefi0ahhoaiin7sfyta28rx27ry18pg60xo1pv91rvbgfzzk4g3hyaji9al2jqxm8neeheqjbkd91c2kdehi1amhpanpe7t928i7y9i7d9jb5i98pdw7bg57wkp1vtxbddp8c929m94bc9mad959o96a896n1th69sb6csb63scbixi5euq5iur76xej1eifzanftapea42j8ejfmaqfpar7keroiasooaulf9doxevmj4rluc8lt5unpmaae8a8gav7tawfjp5b48b9kay6rdx6bqyk3ekf9azghb0l0hxhfb2dj58pidrmg9eomb3o6b4kg5sobb5o8b7nn7ugo8ci2b8hgb9k1dchn8ehcbbia7w54p8e1em7h659sbcisbta18f94bd8t7x33ntnyk88fgm7qh24rgya3ke8egorad741x3jjengbbfhsbgji6mh3fvivbvhabhcan7l5hyg3big5bkjxdefr8fh1blf059flm1k0lgiglqann3l4q8krlhkqnwlqq9kznxjqnyhwlrllqbijodkuo0expdngrhf5ixi6ltbff3iwoek8lihxirf4iyjmklfefdhklu6ul5eql0gqwhgupqj6vpgllbmpnri3isa6p9gzpjiklkjrq0acw8kalvh8ofkvq2j0o1h6lxhjitgdmq9jl3cjjkkhorhtlxojm8eij0jvh6ifllpnnb", "DOUBLE BASS": "mjobknkqjuktk3kvu1tukwkyk0l0jmyjmnoek6l3kcl5ken0votwktl8kzlbklldwcohvblguwlivlydrdojovmlp1llp8mnseompdlmpalpphlrsnoopjyzr7pesxorprphppx2rlnriywfw2luwoouxkntxyy8quzznjk8npkanckdtnpanskgnnkiy2ovkqlxk9lzkhm2n9oxspnwyenkq7svoopnorpqsbvuulsxtdptt8pvucv9y9o2xnpyxgq0zzt0ybt2xvq2xrq4x6uuyzo5yoq7yjq9z3rpedcubla6boa9lge0ftcxbxacc2aes6g0f3czqzqcazahibd1end3bu8e2pso2gs0j5d6gvajvzmsjdc3ewd9c4amrhqfwyrso5ncobqhngqkqrt5fqdbb3apbdbmsvt8brarrbqmbz7oiwc6hpashfavj9c8iodegfaygyb0itcbqhtao2qpo0qrr4tdqctfmqqun3o8nwmuq9tiohqxojqzrqsapwtko9r2omr4e2jmuqtntqr7u5ravtvxvitqu8rctxrftuudv8u9tfrhtjrkuuu3cj9s640qbg6m7b0sg5696x1o6k0vhw009i3rda4mgi03993t9u2o0096cd90540y9z2q733weu4o71j2di3yf6g58rbrag4r4a058k41b5b5ej4u3j6cfc77clb8a34w4x10asfv7w1q7d1ti308ea13ij2tn0cgfg4z8y1v7g1y839hglbi5e159b21cbjfiga09q51an2w7k2y9k5j8n237y315sexcs448f26gq396o9dc77a5z8m9n9ocu8t9633cy5m5h6f8w3b4uenav8w440abi467728aj6x5n18dp7c7p9vds7ylcgfef7292bbd75pjohfa5bddm9j598ico548bc1ez5r6uese68o6cdjh6goeqgqgbp8h8is5jejb8doac6phbfnh2sge0h4hjmhfw815cefde5ud1gtg283hn7t", "RIDE": "i2d6hhbicx96njptkjht624rhlnrvpzzm3hxqig2jadakyg5k6mtd19amgthl4jdhpbmqdg9b8decb9f734vpho5bcdif3ei6b4zlfx2dec2ggnjawk3htrxapdmncmgf6emr1l8gultc19j5c53tdtb9s3j0m009j56ae3n98h4fqsbulvhbg3r0r04550scfbqbk3v4kr7c6q4twu0b23y2w424f0wd5rniyp93s2np3xkwhuyflsf0y084wbum8qvbo48dxghd9q8zzwf509u675a775el9mxe1gl7b5j7g5nbtc67k5r6y5vn9jr5uca6t5z7o63cjcd7s676g6bori75l9x4q6f5q6iivp18oa17w6m6l6qfgrg8ta67z6v836z6paa5g738777pnjj8xae8b7b8f7fj4chgl7jeo7npycyimaigz7qib7up8n1faamhx9nje7yrhjncoaqgp83kcofjuphs0eacs2qpcdpe9auej87exfuluayg08bes8fv4llhab2ir8ju0eqa0ib002w3ef15yi1eeig2a1klpzrw88pdmik3x1o8kf5g5hc211ra8fjdsio1o1v91f9gbm8jkis2p2zbxewjxiw241z31fdktxf2jdx3n23lkxtuwnv", "TWO-STEP": "1qg43j9v4zewovflrldws0c1sbccunh7uaf8sncosyd1tadcl9ryjntemaxkllz3khxwigy8ixzezzzza1l500if1djnfqhknevkmnullyspwxqcnrsao4u1n0uwkwk93y9b4e7o32biehar2lb42a7z0m8b5znvgir4japri3p0z9ngk0mjhppdhbo6gvmxdf3obf00bq0cdr59d21van0nb22gcg45", "BREAKDOWN": "ah5y8f6o7z7b738rj4pl7x7c7n7farfj5s6p5eg7ehmoeelgeq21lmqxf946g410aa48c3js8cayfge2g89id1je1ujh1rsf1k60444ab8pqcjfre4lmjhbylyf3moiyl513kl14ae4b95j1534w98sv6q7g4rfm7ucf0000d74em8smgqe4hamwjmlphsrbhljvbbbz8rtdbyft7p2w9mq89hh6hujn82632b2f6f397scudtif312hhyhlbmhs462jaycgdfend5u14j2lknjw9b7j4a2n874zbu8sa37l6y3adak8c8ez4e2pa8gc8kgmc1hu76dyl9hd5y7n2u3c6bgdcyf568df2w3e3mcxclhx2y3g8wfa3fgi9eh22q3j4uqc7j8v90ha4b50i5er63643w531d2scth3783k8tggcpprbkdt5v3namcjavbba57p8ocy8a55c6dv6u3oenudh38xfm56es59fn5aeu5dfq5gew5hgma4qdrnn7nenpngnfninknknsnmninot6urpnromjnrn2nsoaztqgt4nnnvvbmdvpq2vyn7thvuvlmgxiullkquw1r1x1umvumhvrtfvin9x5r3v8nbxyl2tet5vojatjrqxel4y1rjsvl5sftah68yft5jez9rg791gyc2fu5lf09uh792fw5nf39wiac3fj5qf49xhkbigv95fy5rf6a0dp98h1c6g05ufcahbx3rsirtranwrcnytwuuqzmkrdo1rgo2lppdsarur7o5rho6sjrxrko9rnobuvu9zwodzzofztohy4s3zrojzpomzjonzdoqwnryujorucouxvsautowuhoxuep0wcvmv3p1ump4uzp6vdp8uppaxps5nyphbq67lri99s17ikg4dbkhe6n39vltor7qnw99o69bi67te93tiobqr2l840a64h8f397365bc4oar5g8i4zc84wa96h8k5nca3rbf5laa5c8m35769q4h9w199z1beadncw4ia01d9j1fdidjj64kmc1hmf1kmxgvk568lv0mmh1lj9xmxbvbyztjywtmt9vqx0vcz5tnyutqxszzokqik0lvl3my58iwowqkkqlxkdlzcdliooqmk3m2kim3m1xroxqpktm6kgm7ouq4ld7wjx3viccpmtjkju3xm4g0ky86mqqqka6vurlblg87nck4l03yv5sokv41pt05n59dnaaulbinoi7xk8doo47z"};
const SECTIONS = ['INTRO', 'GROOVE', 'UPBEAT', 'THRASH', 'DOUBLE BASS', 'RIDE', 'TWO-STEP', 'BREAKDOWN'];
const ALPH = '0123456789abcdefghijklmnopqrstuvwxyz';
const PADS = SECTIONS.map(n => {
  const s = DOTS[n] || '', out = [];
  for (let i = 0; i + 3 < s.length; i += 4) out.push([(ALPH.indexOf(s[i]) * 36 + ALPH.indexOf(s[i + 1])) / 1295, (ALPH.indexOf(s[i + 2]) * 36 + ALPH.indexOf(s[i + 3])) / 1295]);
  return out;
});

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteName = n => NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 2);
const LANES = [['KICK', 36], ['SNARE', 38], ['RIMSHOT', 40], ['SIDESTICK', 37], ['HAT SHUT', 42], ['HAT OPEN', 46], ['HAT PEDAL', 44], ['RIDE', 51], ['RIDE BELL', 53],
  ['CRASH', 49], ['CRASH 2', 57], ['CHINA', 52], ['SPLASH', 55], ['TOM 1', 48], ['TOM 2', 45], ['TOM 3', 43], ['TOM 4', 41]];
const CREDIT = 'Preview drums: The Aasimonster by DrumGizmo.org, CC BY 4.0 (mixed and trimmed for Bruno)';

function hash01(x, y, salt) {
  let h = Math.imul(x | 0, 0x9E3779B1) ^ Math.imul(y | 0, 0x85EBCA77) ^ Math.imul(salt | 0, 0xC2B2AE3D);
  h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; h = Math.imul(h, 0x297A2D39); h ^= h >>> 15;
  return (h >>> 8) / 16777216;
}

// ---------- what he plays (for the motion and the take strip) ----------
// A bar as the strip draws it: [pos in beats, row, vel]. Rows: k kick,
// s snare, t tom, c crash, h hats and ride. Not the bank's bars, just
// enough of each section's character to read right at strip size.
function bar(n, sec, fill) {
  const out = [], rnd = (i, s = 0) => hash01(n, i, 31 + sec * 7 + s);
  const name = SECTIONS[sec] || 'GROOVE';
  const fast = name === 'THRASH' || name === 'DOUBLE BASS', half = name === 'BREAKDOWN' || name === 'INTRO';
  const step = fast ? .5 : name === 'TWO-STEP' ? .5 : .5;
  if (n % 4 === 0) out.push([0, 'c', 120]);
  for (let b = 0; b < 4; b += step) {
    if (!(b === 0 && n % 4 === 0)) out.push([b, 'h', b % 1 ? 70 : 96]);
  }
  if (name === 'DOUBLE BASS') for (let b = 0; b < 4; b += .25) out.push([b, 'k', 100 + rnd(b * 4) * 20]);
  else if (name === 'THRASH') for (let b = 0; b < 4; b += .5) out.push([b, 'k', 104]);
  else if (half) { out.push([0, 'k', 120]); out.push([2.5, 'k', 100]); if (rnd(1) > .5) out.push([3.5, 'k', 90]); }
  else { out.push([0, 'k', 118]); out.push([1.5, 'k', 96]); out.push([2, 'k', 110]); if (rnd(2) > .55) out.push([3.75, 'k', 84]); }
  if (half) out.push([2, 's', 124]);
  else if (fast) { out.push([.5, 's', 118]); out.push([1.5, 's', 118]); out.push([2.5, 's', 118]); out.push([3.5, 's', 118]); }
  else { out.push([1, 's', 120]); out.push([3, 's', 122]); if (rnd(3) > .5) out.push([2.75, 's', 40]); }
  if (fill) {
    const from = fill === true ? 2 : 4 - fill;
    for (let i = out.length - 1; i >= 0; i--) if (out[i][0] >= from && out[i][1] !== 'k') out.splice(i, 1);
    for (let b = from; b < 4; b += .25) out.push([b, b < from + 1 ? 's' : 't', 90 + rnd(b * 4, 9) * 37]);
    out.push([3.75, 'c', 110]);
  }
  return out.sort((a, b) => a[0] - b[0]);
}
const ROW = { k: .88, s: .62, t: .45, c: .1, h: .26 };
const ROWC = { k: INK, s: RED, t: TEAL, c: ORANGE, h: mix(MUSTARD, INK, .3) };

// ---------- the state ----------
const BASE = {
  time: 0,             // seconds, for everything that moves on its own
  playing: false, armed: false, ending: false, filling: null, // filling null: work it out
  pos: 0,              // beats since he started (playing)
  bpm: 176,            // the tempo shown (host's)
  follow: false, take: 'SAME', section: 1, pending: -1, groove: null,
  x: .5, y: .3, fill: .35, variation: .25,
  phrase: 8, launch: 'BAR',
  tempoSrc: 'HOST', setBpm: 160, speed: 'NORMAL',
  keyNote: 12, keyChannel: 0, lastKey: -1,
  channel: 10, velocity: 1, mapOpen: false, port: '', portsOpen: false, portHover: -1,
  kit: 'OFF', vol: .8,
  takeBars: [],        // [[bar number from 0, section, fill], ...]
  quote: undefined,    // a string, null for none, undefined for his own
  hover: null, press: null,
};

// ---------- layout (window pixels, from editor.rs) ----------
const R = (x0, y0, x1, y1) => [x0, y0, x1 - x0, y1 - y0];
const RECTS = {
  window: [0, 0, W, H],
  header: [0, 0, W, 100],
  title: [20, 0, 300, 100],
  follow: [430, 16, 200, 30], take: [430, 56, 200, 30], reroll: [642, 56, 86, 30],
  status: [744, 18, 254, 72], play: [1012, 18, 68, 68],
  stage: R(16, 104, 290, 484),
  mood: R(304, 104, 684, 484), pad: R(334, 132, 668, 454),
  sections: R(698, 104, 1084, 300), marquees: R(710, 128, 1072, 244), phrase: [710, 259, 260, 30], fillnow: [992, 259, 80, 30],
  knobs: R(698, 316, 1084, 484), fillknob: [736, 328, 120, 150], varknob: [926, 328, 120, 150],
  takestrip: R(16, 500, 1084, 598), strip: R(30, 518, 894, 586), takeside: R(906, 514, 1072, 588), dragme: [906, 536, 166, 28], clear: [906, 562, 166, 24],
  tempo: R(16, 620, 226, 708), tempoSrc: [28, 636, 104, 28], bpm: [142, 634, 72, 32], speed: [28, 672, 186, 26],
  phrasing: R(238, 620, 448, 708), bars: [290, 636, 146, 28], launch: [290, 672, 146, 26],
  keys: R(460, 620, 744, 708), keyFrom: [472, 648, 62, 32], keyCh: [542, 648, 62, 32], legend: [612, 632, 130, 50],
  output: R(756, 620, 950, 708), chan: [766, 634, 50, 30], vel: [822, 634, 58, 30], map: [886, 634, 54, 30], port: [766, 672, 174, 26],
  kit: R(962, 620, 1084, 708), kitsegs: [970, 636, 106, 28], vol: [970, 676, 106, 16],
  notemap: [270, 120, 560, 420], portmenu: [650, 572, 300, 96],
};
for (let i = 0; i < 8; i++) RECTS['sec' + i] = [710 + (i % 4) * 92.5, 128 + Math.floor(i / 4) * 62, 84.5, 54];

// ---------- the paper (theme.rs paper(), made once) ----------
let PAPER_TEX = null;
function paperTexture() {
  if (PAPER_TEX) return PAPER_TEX;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), img = c.createImageData(W, H), d = img.data;
  const vn = (x, y, salt) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, s = t => t * t * (3 - 2 * t), sx = s(fx), sy = s(fy);
    const a = hash01(xi, yi, salt), b = hash01(xi + 1, yi, salt), cc = hash01(xi, yi + 1, salt), dd = hash01(xi + 1, yi + 1, salt);
    const top = a + (b - a) * sx, bot = cc + (dd - cc) * sx; return top + (bot - top) * sy;
  };
  const stains = [[.12, .85, .10], [.83, .18, .08], [.62, .92, .06], [.35, .08, .05]];
  const P = hex(PAPER);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W, v = y / H;
    const blotch = vn(x / 90, y / 90, 1) * .6 + vn(x / 23, y / 23, 2) * .4, fibre = vn(x / 2.5, y / 9, 3);
    const edge = Math.max(0, Math.max(Math.abs(u - .5) * 2, Math.abs(v - .5) * 2) - .7) / .3;
    let stain = 0;
    for (const [sx, sy, r] of stains) {
      const dd = Math.hypot(u - sx, (v - sy) * H / W), ring = Math.max(0, 1 - Math.abs(dd - r) / .006);
      stain += ring * .5 + (dd < r ? .12 : 0);
    }
    const dark = .06 * blotch + .03 * fibre + .16 * edge * edge + .05 * stain, o = (y * W + x) * 4;
    d[o] = P[0] * (1 - dark * .8); d[o + 1] = P[1] * (1 - dark); d[o + 2] = P[2] * (1 - dark * 1.5); d[o + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  return (PAPER_TEX = cv);
}

// ---------- drawing helpers (theme.rs) ----------
function Painter(c) {
  const P = {};
  const font = (f, size) => { const F = FONTS[f]; c.font = `${(size * F.k).toFixed(2)}px ${F.fam}`; return F; };
  P.measure = (s, f, size) => { font(f, size); return c.measureText(s).width; };
  // align: two letters, horizontal (l c r) then vertical (t c b), like egui's Align2
  const place = (x, y, align, s, f, size) => {
    const F = font(f, size), w = c.measureText(s).width;
    const left = align[0] === 'l' ? x : align[0] === 'c' ? x - w / 2 : x - w;
    const top = align[1] === 't' ? y : align[1] === 'c' ? y - size / 2 : y - size;
    return { left, top, w, base: top + size * F.ar };
  };
  P.text = (x, y, align, s, f, size, color) => {
    const p = place(x, y, align, s, f, size);
    c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = color; c.fillText(s, p.left, p.base);
    return [p.left, p.top, p.w, size];
  };
  P.outlined = (x, y, align, s, f, size, fill, outline, width) => {
    const p = place(x, y, align, s, f, size);
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    if (width > 0 && outline) { c.lineJoin = 'round'; c.lineWidth = width * 2; c.strokeStyle = outline; c.strokeText(s, p.left, p.base); }
    c.fillStyle = fill; c.fillText(s, p.left, p.base);
    return [p.left, p.top, p.w, size];
  };
  P.headline = (x, y, align, s, f, size, fill, shadow) => {
    const w = Math.max(size / 12, 2);
    P.outlined(x + size / 14, y + size / 11, align, s, f, size, shadow, INK, w);
    return P.outlined(x, y, align, s, f, size, fill, INK, w);
  };
  P.turned = (cx, cy, s, f, size, color, angle) => { c.save(); c.translate(cx, cy); c.rotate(angle); P.text(0, 0, 'cc', s, f, size, color); c.restore(); };
  P.fit = (s, size, min, width, f) => { let z = size; while (z > min && P.measure(s, f, z) > width) z -= 1; return z; };
  P.rr = (r, rad) => {
    const [x, y, w, h] = r, q = Math.max(0, Math.min(rad, w / 2, h / 2));
    c.beginPath(); c.moveTo(x + q, y); c.arcTo(x + w, y, x + w, y + h, q); c.arcTo(x + w, y + h, x, y + h, q); c.arcTo(x, y + h, x, y, q); c.arcTo(x, y, x + w, y, q); c.closePath();
  };
  P.fillRR = (r, rad, color) => { P.rr(r, rad); c.fillStyle = color; c.fill(); };
  P.strokeRR = (r, rad, w, color) => { P.rr(r, rad); c.lineWidth = w; c.strokeStyle = color; c.stroke(); };
  P.circle = (x, y, r, color) => { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.fillStyle = color; c.fill(); };
  P.ring = (x, y, r, w, color) => { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.lineWidth = w; c.strokeStyle = color; c.stroke(); };
  P.line = (x0, y0, x1, y1, w, color) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineWidth = w; c.strokeStyle = color; c.lineCap = 'butt'; c.stroke(); };
  P.poly = (pts, fill, w, stroke) => {
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (w) { c.lineWidth = w; c.strokeStyle = stroke; c.lineJoin = 'miter'; c.stroke(); }
  };
  P.ellipse = (x, y, rx, ry, color) => { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU); c.fillStyle = color; c.fill(); };
  P.clip = (r, fn) => { c.save(); c.beginPath(); c.rect(r[0], r[1], r[2], r[3]); c.clip(); fn(); c.restore(); };
  const shrink = (r, d) => [r[0] + d, r[1] + d, r[2] - 2 * d, r[3] - 2 * d];
  const move = (r, dx, dy) => [r[0] + dx, r[1] + dy, r[2], r[3]];
  const ctr = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];
  P.shrink = shrink; P.move = move; P.ctr = ctr;

  P.card = (r, rad, fill, lift) => {
    if (lift > 0) P.fillRR(move(r, lift, lift + 1), rad, INK);
    P.fillRR(r, rad, fill);
    P.strokeRR(r, rad, 2.5, INK);
  };
  P.shine = (r, rad) => P.fillRR([r[0] + rad * .6 + 4, r[1] + 4, Math.min(r[2] * .3, 50), 3.5], 2, alpha(WHITE, .6));
  P.button = (r, label, color, lit, size, hovered, pressed) => {
    const face = pressed ? move(r, 2, 2) : r;
    const fill = lit ? color : hovered ? mix(color, PAPER, .7) : PAPER;
    P.card(face, 9, fill, pressed ? 1 : 3.5);
    P.shine(face, 9);
    const [cx, cy] = ctr(face);
    P.outlined(cx, cy + 1, 'cc', label, 'titan', size, lit ? PAPER : INK, lit ? INK : null, lit ? 2 : 0);
  };
  P.segments = (r, labels, on, color, size, hover) => {
    P.card(r, 8, PAPER, 3);
    const n = labels.length, w = r[2] / n;
    labels.forEach((label, i) => {
      const seg = [r[0] + i * w, r[1], w, r[3]], inner = shrink(seg, 3), lit = on === i;
      if (lit) { P.fillRR(inner, 6, color); P.strokeRR(inner, 6, 2, INK); }
      else if (hover === i) P.fillRR(inner, 6, alpha(color, .3));
      if (i > 0) P.line(seg[0], seg[1] + 6, seg[0], seg[1] + seg[3] - 6, 1.5, alpha(INK, .35));
      const z = P.fit(label, size, 9, inner[2] - 4, 'titan'), [cx, cy] = ctr(inner);
      P.outlined(cx, cy + 1, 'cc', label, 'titan', z, lit ? PAPER : INK, INK, lit ? 1.5 : 0);
    });
  };
  P.toggle = (r, label, on, color, hovered, pressed) => {
    const face = pressed ? move(r, 1.5, 1.5) : r, rad = face[3] / 2;
    P.card(face, rad, on ? color : hovered ? PAPER_DARK : PAPER, pressed ? 1 : 2.5);
    const cx = face[0] + rad, cy = face[1] + rad;
    P.circle(cx, cy, rad - 5, PAPER); P.ring(cx, cy, rad - 5, 2, INK);
    if (on) {
      const s = rad - 5;
      c.beginPath(); c.moveTo(cx - s * .55, cy); c.lineTo(cx - s * .1, cy + s * .45); c.lineTo(cx + s * .65, cy - s * .5);
      c.lineWidth = 3; c.strokeStyle = INK; c.lineJoin = 'miter'; c.stroke();
    }
    P.outlined(face[0] + 2 * rad + 2, cy + 1, 'lc', label, 'titan', 13, on ? PAPER : INK, INK, on ? 1.5 : 0);
  };
  P.dragBox = (r, text, size, hot) => {
    P.card(r, 8, hot ? WHITE : PAPER, 3);
    const z = P.fit(text, size, 10, r[2] - 10, 'titan'), [cx, cy] = ctr(r);
    P.text(cx, cy + 1, 'cc', text, 'titan', z, INK);
  };
  P.slider = (r, color, v) => {
    const rad = r[3] / 2;
    P.card(r, rad, PAPER_DARK, 2.5);
    const fill = shrink([r[0], r[1], Math.max(r[2] * v, 2 * rad), r[3]], 2.5);
    P.fillRR(fill, rad - 2.5, color);
    P.shine(fill, rad);
    P.strokeRR(r, rad, 2.5, INK);
  };
  P.panel = (r, title, color) => {
    P.card(r, 12, PAPER, 5);
    const tab = [r[0] + 14, r[1] - 12, P.measure(title, 'titan', 14) + 22, 22];
    P.card(tab, 6, color, 2.5);
    const [cx, cy] = ctr(tab);
    P.outlined(cx, cy + 1, 'cc', title, 'titan', 14, PAPER, INK, 2);
  };
  P.caption = (x, y, s) => P.text(x, y, 'lb', s, 'comic', 12, alpha(INK, .75));
  P.sunburst = (cx, cy, r, rays, a, b, spin) => {
    if (a) P.circle(cx, cy, r, a);
    c.fillStyle = b;
    for (let k = 0; k < rays; k++) {
      const a0 = spin + k / rays * TAU, a1 = a0 + TAU / rays * .5;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r); c.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r); c.closePath(); c.fill();
    }
  };
  P.starburst = (cx, cy, r, points, fill, spin) => {
    const pts = [];
    for (let i = 0; i < points * 2; i++) { const a = spin + i / (points * 2) * TAU, rr = i % 2 ? r * .7 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    P.poly(pts, fill, 3, INK);
  };
  P.puff = (cx, cy, r, a, outline) => {
    const lobes = [[-.55, .15, .55], [0, -.2, .7], [.55, .1, .55], [0, .3, .55]];
    if (outline > 0) for (const [dx, dy, s] of lobes) P.circle(cx + dx * r, cy + dy * r, s * r + outline, alpha(INK, a));
    for (const [dx, dy, s] of lobes) P.circle(cx + dx * r, cy + dy * r, s * r, alpha(WHITE, a));
  };
  P.balloon = (r, to, text, size) => {
    const bx = Math.min(Math.max(to[0], r[0] + 24), r[0] + r[2] - 24), by = r[1] + r[3] - 4;
    P.poly([[bx - 11, by], [bx + 11, by], to], WHITE, 3, INK);
    P.fillRR(shrink(r, -3), r[3] / 2 + 3, INK);
    P.fillRR(r, r[3] / 2, WHITE);
    P.poly([[bx - 8, by - 5], [bx + 8, by - 5], [bx, by + 6]], WHITE);
    const z = P.fit(text, size, 10, r[2] - 20, 'titan'), [cx, cy] = ctr(r);
    P.text(cx, cy + 1, 'cc', text, 'titan', z, INK);
  };
  P.drumKnob = (cx, cy, r, v, hot) => {
    P.circle(cx + 4, cy + 6, r + 6, INK);
    P.circle(cx, cy, r + 6, RED); P.ring(cx, cy, r + 6, 3, INK);
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU + PI / 8, px = cx + Math.cos(a) * (r + 6), py = cy + Math.sin(a) * (r + 6);
      P.circle(px, py, 4.5, MUSTARD); P.ring(px, py, 4.5, 2, INK);
    }
    P.circle(cx, cy, r, PAPER); P.ring(cx, cy, r, 2.5, INK);
    const start = PI * .75, sweep = PI * 1.5;
    const arc = (to, color, w) => { c.beginPath(); c.arc(cx, cy, r - 9, start, start + sweep * to); c.lineWidth = w; c.strokeStyle = color; c.lineCap = 'butt'; c.stroke(); };
    arc(1, alpha(INK, .15), 7);
    if (v > .001) arc(v, hot, 7);
    P.circle(cx, cy, r * .28, alpha(PAPER_DARK, .8));
    const a = start + sweep * v, tip = [cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4)], butt = [cx - Math.cos(a) * r * .25, cy - Math.sin(a) * r * .25];
    P.line(butt[0], butt[1], tip[0], tip[1], 9, INK);
    P.line(butt[0], butt[1], tip[0], tip[1], 5.5, '#c88a4a');
    P.circle(tip[0], tip[1], 6, INK); P.circle(tip[0], tip[1], 4, '#e9c28a');
  };
  P.marquee = (r, label, sub, on, pending, enabled, time, hovered, pressed) => {
    const face = pressed ? move(r, 2, 2) : r, blink = pending && frac(time * 6) < .5;
    const fill = !enabled ? PAPER_DARK : on || blink ? MUSTARD : hovered ? WHITE : PAPER;
    P.card(face, 8, fill, pressed ? 1 : 3.5);
    const inner = shrink(face, 6), per = [9, 3, 9, 3];
    let k = 0;
    per.forEach((n, side) => {
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const p = side === 0 ? [inner[0] + inner[2] * t, inner[1]] : side === 1 ? [inner[0] + inner[2], inner[1] + inner[3] * t]
          : side === 2 ? [inner[0] + inner[2] - inner[2] * t, inner[1] + inner[3]] : [inner[0], inner[1] + inner[3] - inner[3] * t];
        const lit = (on || blink) && (k + Math.floor(time * 8)) % 3 !== 0;
        P.circle(p[0], p[1], 2.3, lit ? '#fff3b0' : alpha(INK, .22));
        k++;
      }
    });
    const tc = enabled ? 1 : .35, [cx, cy] = ctr(face);
    P.text(cx, cy - 5, 'cc', label, 'titan', P.fit(label, 16, 9, face[2] - 22, 'titan'), alpha(INK, tc));
    P.text(cx, cy + 11, 'cc', sub, 'comic', 11, alpha(INK, tc * .7));
  };
  P.bigButton = (cx, cy, r, color, glyph, time, pulse, hovered, pressed) => {
    const c2 = pressed ? [cx + 2, cy + 3] : [cx, cy], grow = pulse ? Math.sin(time * 4) * 2 : 0;
    P.circle(cx + 4, cy + 6, r, INK);
    P.circle(c2[0], c2[1], r + grow, hovered ? mix(color, WHITE, .15) : color);
    P.ring(c2[0], c2[1], r + grow, 3, INK);
    P.circle(c2[0] - r * .35, c2[1] - r * .4, r * .16, alpha(WHITE, .7));
    const s = r * .42;
    if (glyph === 'play') P.poly([[c2[0] - s * .6, c2[1] - s], [c2[0] + s, c2[1]], [c2[0] - s * .6, c2[1] + s]], PAPER, 3, INK);
    else if (glyph === 'stop') { const q = [c2[0] - s * .75, c2[1] - s * .75, s * 1.5, s * 1.5]; P.fillRR(q, 3, PAPER); P.strokeRR(q, 3, 3, INK); }
    else [-.6, 0, .6].forEach((dx, i) => {
      const up = (Math.floor(time * 6) + i) % 3 === 0 ? 4 : 0, px = c2[0] + dx * s, py = c2[1] - up;
      P.circle(px, py, s * .22, PAPER); P.ring(px, py, s * .22, 2, INK);
    });
  };
  P.iris = () => {
    const cx = W / 2, cy = H / 2, r = Math.hypot(W, H) / 2;
    for (let i = 0; i < 14; i++) { const t = i / 14; P.ring(cx, cy, r * (.82 + .18 * t), r * .18 / 14 * 2.5, alpha(INK, .03 + .05 * t)); }
  };
  return P;
}

// ---------- the window ----------
function BrunoWindow(host, opts = {}) {
  const base = opts.base ?? '/';
  const fontUrl = f => (opts.fonts && opts.fonts[f]) || base + 'assets/fonts/bruno/' + FONTS[f].file;
  const art = new Image();
  art.src = opts.art || base + 'assets/bruno-art.webp';
  const cv = document.createElement('canvas');
  cv.setAttribute('role', 'img');
  cv.setAttribute('aria-label', "Bruno's window: his stage, the mood pad, sections, fills and variation, the take, and the settings.");
  cv.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;display:block`;
  host.style.position = host.style.position || 'relative';
  host.style.width = W + 'px'; host.style.height = H + 'px';
  host.appendChild(cv);
  const c = cv.getContext('2d');
  const P = Painter(c);
  let scale = 0;
  const ready = Promise.all([
    ...Object.keys(FONTS).map(f => {
      const F = FONTS[f];
      if ([...document.fonts].some(x => x.family === F.fam)) return Promise.resolve();
      const face = new FontFace(F.fam, `url(${fontUrl(f)})`);
      return face.load().then(ff => document.fonts.add(ff)).catch(() => {});
    }),
    art.decode ? art.decode().catch(() => {}) : Promise.resolve(),
  ]);

  function setScale(k) {
    k = Math.max(1, Math.min(4, Math.round(k * 2) / 2));
    if (k === scale) return;
    scale = k; cv.width = Math.round(W * k); cv.height = Math.round(H * k);
  }
  setScale(opts.scale || Math.min(3, (G.devicePixelRatio || 1) * 1.25));

  // What he's doing at st.pos: the bar, the hits so far, how hard he's going.
  function feel(st) {
    const beat = st.pos || 0, n = Math.floor(beat / 4), inBar = beat - n * 4;
    const k = ((n % st.phrase) + st.phrase) % st.phrase;
    const mania = st.fill >= .97 && st.playing;
    const filling = st.filling != null ? st.filling : st.playing && (mania || (st.fill >= .3 && k === st.phrase - 1 && inBar >= 2));
    let kick = 0, energy = 0;
    if (st.playing) {
      const spb = 60 / (st.bpm || 120);
      const sec = st.section;
      const hits = bar(n - 1, sec, false).map(h => [h[0] - 4, h[1]]).concat(bar(n, sec, filling ? true : false));
      for (const [p, row] of hits) {
        const dt = (inBar - p) * spb;
        if (dt < 0 || dt > .6) continue;
        energy += .35 * Math.exp(-dt * 9);
        if (row === 'k') kick = Math.max(kick, Math.exp(-dt * 14));
      }
    }
    return { n, k, inBar, mania, filling, kick, energy: Math.min(1, energy) };
  }

  function quote(st, f) {
    if (st.quote !== undefined) return st.quote;
    const b = Math.floor(st.time / 4), pick = list => list[Math.floor(hash01(b, list.length, 77) * list.length) % list.length];
    if (f.mania) return 'FILL MANIA!!!';
    if (st.ending) return 'AND... DONE.';
    if (f.filling) return pick(['WATCH THIS!', 'OUTTA MY WAY!', 'HERE IT COMES!']);
    if (st.armed) return 'ONE, TWO, ONE TWO THREE FOUR!';
    if (st.playing) return hash01(b, 1, 78) < .45 ? null : pick(["NOW WE'RE TALKIN'!", 'KEEP UP, PAL!', 'LOUDER!', "THAT'S HOW IT'S DONE!", 'FEEL THAT?']);
    return pick(["WELL? I AIN'T GOT ALL DAY!", 'HIT THE KEY, PAL.', "I DON'T DO BALLADS.", 'YOU CALL THAT A COUNT-IN?', "QUIT STALLIN'!"]);
  }

  // The groove he's on: near the puck, wandering a little bar to bar.
  function grooveOf(st, f) {
    if (st.groove != null) return st.groove;
    if (!st.playing) return -1;
    const dots = PADS[st.section] || [];
    if (!dots.length) return -1;
    const all = dots.map((d, i) => [Math.hypot(d[0] - st.x, d[1] - st.y), i]).sort((a, b) => a[0] - b[0]);
    // Not the very nearest, which sits under the puck and can't be seen.
    const near = all.slice(Math.min(2, all.length - 1), 6 + Math.round(st.variation * 12));
    return near[Math.floor(hash01(f.n, st.section, 5) * near.length)][1];
  }

  const hov = (st, name) => st.hover === name, prs = (st, name) => st.press === name;

  function draw(st) {
    st = Object.assign({}, BASE, st);
    const t = st.time, f = feel(st);
    c.setTransform(scale, 0, 0, scale, 0, 0);
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
    c.drawImage(paperTexture(), 0, 0, W, H);
    header(st, f);
    stage(st, f);
    moodPad(st, f);
    sections(st, f);
    knobs(st);
    takeStrip(st);
    tempoPanel(st);
    feelPanel(st);
    keysPanel(st);
    outputPanel(st);
    kitPanel(st);
    P.text(W - 18, H - 4, 'rb', 'v0.1.0 · Trilsoft', 'comic', 10.5, alpha(INK, .7));
    P.text(18, H - 4, 'lb', CREDIT, 'comic', 10.5, alpha(INK, .7));
    P.iris();
    portMenu(st);
    noteMap(st);
  }

  function header(st, f) {
    const t = st.time;
    P.clip([0, 0, 320, 98], () => P.sunburst(152, 54, 140, 20, alpha(MUSTARD, .55), alpha(ORANGE, .45), t * .05));
    let x = 40;
    ['B', 'R', 'U', 'N', 'O'].forEach((l, i) => {
      const bob = Math.sin(t * 3 + i * .9) * 3;
      const r = P.headline(x, 46 + bob, 'lc', l, 'rye', 62, RED, MUSTARD);
      x = r[0] + r[2] + 2;
    });
    P.outlined(152, 88, 'cc', 'THE DRUMMER WHO TAKES NO GUFF', 'titan', 13, PAPER, INK, 2);
    P.toggle(RECTS.follow, 'START WITH HOST', st.follow, TEAL, hov(st, 'follow'), prs(st, 'follow'));
    P.segments(RECTS.take, ['SAME TAKE', 'NEW TAKE'], st.take === 'NEW' ? 1 : 0, TEAL, 13, st.hover === 'take' ? 1 - (st.take === 'NEW' ? 1 : 0) : -1);
    P.button(RECTS.reroll, 'REROLL', ORANGE, false, 14, hov(st, 'reroll'), prs(st, 'reroll'));
    const playing = st.playing, sec = SECTIONS[st.section] || '';
    let status, detail;
    if (st.ending) { status = 'LAST HIT!'; detail = "Bruno's finishing the song"; }
    else if (playing) { status = 'PLAYING'; detail = `BAR ${f.k + 1} OF ${st.phrase} · ${sec}`; }
    else if (st.armed) { status = 'COUNTING IN'; detail = 'Waiting for the next bar'; }
    else { status = 'STOPPED'; detail = `Press ${noteName(st.keyNote)} or the button`; }
    P.outlined(990, 36, 'rc', status, 'titan', 20, playing ? RED : INK, PAPER, 1.5);
    P.text(990, 60, 'rc', detail, 'comic', P.fit(detail, 12.5, 9, 246, 'comic'), alpha(INK, .75));
    P.text(990, 80, 'rc', `${Math.round(st.bpm)} BPM`, 'titan', 13, alpha(INK, .6));
    const glyph = st.armed ? 'wait' : playing && !st.ending ? 'stop' : 'play';
    P.bigButton(1046, 52, 34, playing ? RED : TEAL, glyph, t, st.armed, hov(st, 'play'), prs(st, 'play'));
  }

  function stage(st, f) {
    const t = st.time, r = RECTS.stage, [L, T, Wd, Ht] = r, Rt = L + Wd, B = T + Ht, cx = L + Wd / 2;
    P.card(r, 12, RED_DARK, 5);
    const floor = B - 56;
    P.clip(P.shrink(r, 2), () => {
      const folds = 11, w = Wd / folds;
      for (let i = 0; i < folds; i++) {
        const x = L + i * w + Math.sin(t * .8 + i) * 1.5;
        c.fillStyle = alpha(RED, .9); c.fillRect(x, T, w * .55, Ht);
        P.line(x, T, x, B, 1, alpha(INK, .3));
      }
      P.poly([[cx - 26, T], [cx + 26, T], [Rt - 14, floor + 30], [L + 14, floor + 30]], 'rgba(255,243,196,.22)');
      c.fillStyle = '#8a5a32'; c.fillRect(L, floor, Wd, B - floor);
      for (let k = 0; k < 4; k++) { const y = floor + 10 + k * 13; P.line(L, y, Rt, y, 1.5, alpha(INK, .5)); }
      P.line(L, floor, Rt, floor, 3, INK);
      P.ellipse(cx, floor + 22, 84, 14, 'rgba(255,243,196,.35)');
      c.fillStyle = MUSTARD; c.fillRect(L, T, Wd, 16);
      const n = 9, sw = Wd / n;
      for (let i = 0; i < n; i++) { const x = L + sw * (i + .5); P.circle(x, T + 16, sw / 2, MUSTARD); P.ring(x, T + 16, sw / 2, 2, INK); }
      c.fillStyle = MUSTARD; c.fillRect(L, T, Wd, 16);
      P.line(L, T + 16, Rt, T + 16, 1.5, alpha(INK, .4));

      if (art.complete && art.naturalWidth) {
        const h = 292, w2 = art.naturalWidth * h / art.naturalHeight;
        const squash = 1 - f.kick * .035, hop = f.energy * 7;
        const shake = f.filling || f.mania ? Math.sin(t * 70) * 3 * (.5 + f.energy) : 0;
        const breathe = st.playing ? 0 : Math.sin(t * 1.6) * .012;
        const bw = w2 * (1 + f.kick * .02), bh = h * (squash + breathe);
        const fx = cx + shake, fy = floor + 14 - hop;
        const br = [fx - bw / 2, fy - bh, bw, bh];
        P.ellipse(cx, floor + 14, 70 - hop * 2, 8, alpha(INK, .35));
        c.drawImage(art, br[0], br[1], br[2], br[3]);
        if (f.filling || f.mania || (st.playing && st.fill > .6)) {
          const ex = br[0] + br[2] * .84, ey = br[1] + br[3] * .2;
          for (let k = 0; k < 3; k++) { const ph = frac(t * 1.4 + k / 3); P.puff(ex + ph * 34, ey - ph * 46, 6 + ph * 10, 1 - ph, 2); }
        }
        const q = quote(st, f);
        if (q) {
          const mouth = [br[0] + br[2] * .42, br[1] + br[3] * .24], bubble = [L + 12, T + 26, Wd - 24, 34];
          P.balloon(bubble, [mouth[0], Math.min(mouth[1], bubble[1] + bubble[3] + 40)], q, 15);
        }
      }
    });
    if (f.mania) {
      const mx = Rt - 46, my = T + 118;
      P.starburst(mx, my, 46 + Math.sin(t * 10) * 3, 12, MUSTARD, t * .6);
      P.turned(mx, my, 'FILL', 'titan', 17, RED, -.2);
      P.turned(mx + 2, my + 17, 'MANIA!', 'titan', 13, INK, -.2);
    }
  }

  function moodPad(st, f) {
    const t = st.time;
    P.panel(RECTS.mood, 'HIS MOOD', TEAL);
    const pad = RECTS.pad, [pl, pt, pw, ph] = pad, pr = pl + pw, pb = pt + ph;
    P.fillRR(pad, 8, '#fbf3e0');
    P.clip(P.shrink(pad, 1), () => {
      P.sunburst(pr, pt, pw * 1.5, 28, null, alpha(MUSTARD, .12), 0);
      for (let k = 1; k < 4; k++) {
        const x = pl + pw * k / 4, y = pt + ph * k / 4;
        P.line(x, pt, x, pb, 1, alpha(INK, .08)); P.line(pl, y, pr, y, 1, alpha(INK, .08));
      }
    });
    P.strokeRR(pad, 8, 2.5, INK);
    const at = (x, y) => [pl + x * pw, pb - y * ph];
    P.text(pl + 2, pb + 4, 'lt', 'CALM', 'titan', 12, alpha(INK, .7));
    P.text(pr - 2, pb + 4, 'rt', 'FURIOUS', 'titan', 12, RED);
    P.turned(pl - 9, pb - 26, 'SIMPLE', 'titan', 12, alpha(INK, .85), -PI / 2);
    P.turned(pl - 9, pt + 24, 'FANCY', 'titan', 12, TEAL_DARK, -PI / 2);
    const dots = PADS[st.section] || [], cur = grooveOf(st, f), r = dots.length > 150 ? 3.2 : 4.5;
    dots.forEach((d, i) => {
      if (i === cur) return;
      const [x, y] = at(d[0], d[1]);
      P.circle(x, y, r, MUSTARD); P.ring(x, y, r, 1.2, INK);
    });
    if (cur >= 0 && dots[cur]) {
      const [x, y] = at(dots[cur][0], dots[cur][1]), ring = 9 + (Math.sin(t * 6) + 1) * 2;
      P.ring(x, y, ring, 2, alpha(RED, .7));
      P.circle(x, y, 6.5, RED); P.ring(x, y, 6.5, 2, INK);
    }
    const [px, py] = at(st.x, st.y);
    c.setLineDash([5, 4]);
    P.line(px, pb, px, py, 1.5, alpha(INK, .35));
    P.line(pl, py, px, py, 1.5, alpha(INK, .35));
    c.setLineDash([]);
    P.circle(px + 3, py + 4, 15, alpha(INK, .6));
    P.circle(px, py, 15, '#e9c28a'); P.ring(px, py, 15, 3, INK);
    P.circle(px - 5, py - 5, 4, alpha(WHITE, .8));
    const readout = `ANGER ${Math.round(st.x * 100)} · FANCY ${Math.round(st.y * 100)}`;
    const sw = P.measure(readout, 'comic', 11), tag = [pr - sw - 14, pt + 6, sw + 10, 15];
    P.card(tag, 5, PAPER, 0);
    P.text(tag[0] + tag[2] / 2, tag[1] + tag[3] / 2, 'cc', readout, 'comic', 11, alpha(INK, .75));
  }

  function sections(st, f) {
    const t = st.time, r = RECTS.sections;
    P.panel(r, 'SECTIONS', RED);
    for (let i = 0; i < 8; i++) {
      const name = 'sec' + i;
      P.marquee(RECTS[name], SECTIONS[i], noteName(st.keyNote + 2 + i), i === st.section, st.pending === i, true, t, hov(st, name), prs(st, name));
    }
    const y = r[1] + r[3] - 26;
    P.text(r[0] + 14, y, 'lc', 'PHRASE', 'titan', 12, alpha(INK, .7));
    const bars = st.phrase, step = 200 / bars;
    for (let i = 0; i < bars; i++) {
      const x = r[0] + 82 + step * (i + .5), rr = Math.min(step * .36, 7);
      const fill = !st.playing ? PAPER : i === f.k && f.filling ? ORANGE : i === f.k ? RED : i < f.k ? MUSTARD : PAPER;
      P.circle(x, y, rr, fill); P.ring(x, y, rr, 1.8, INK);
    }
    P.button(RECTS.fillnow, 'FILL!', ORANGE, !!f.filling && st.playing, 16, hov(st, 'fillnow'), prs(st, 'fillnow'));
  }

  function knobs(st) {
    const t = st.time, r = RECTS.knobs;
    P.panel(r, 'HOW HARD', MUSTARD);
    const c1 = [r[0] + 98, r[1] + 72], c2 = [r[0] + r[2] - 98, r[1] + 72];
    if (st.fill >= .97) P.starburst(c1[0], c1[1], 74 + Math.sin(t * 9) * 3, 14, alpha(ORANGE, .9), t * .4);
    P.drumKnob(c1[0], c1[1], 46, st.fill, st.fill >= .97 ? ORANGE : RED);
    P.drumKnob(c2[0], c2[1], 46, st.variation, TEAL);
    const label = (p, name, value) => {
      P.outlined(p[0], p[1] + 68, 'cc', name, 'titan', 17, PAPER, INK, 2);
      P.text(p[0], p[1] + 86, 'cc', value, 'comic', 12, alpha(INK, .7));
    };
    label(c1, 'FILLS', st.fill < .01 ? 'NONE' : st.fill >= .97 ? 'FILL MANIA!' : Math.round(st.fill * 100) + '%');
    label(c2, 'VARIATION', Math.round(st.variation * 100) + '%');
  }

  function takeStrip(st) {
    const r = RECTS.takestrip;
    P.panel(r, 'THE TAKE', INK);
    const s = RECTS.strip, [sl, stp, sw, sh] = s;
    P.fillRR(s, 4, INK);
    for (let x = sl + 6; x < sl + sw - 8; x += 14) for (const y of [stp + 4, stp + sh - 9]) P.fillRR([x, y, 7, 5], 1.5, PAPER_DARK);
    const fw = 30, fits = Math.floor((sw - 8) / fw), shown = st.takeBars.slice(-fits);
    const latest = shown.length ? shown[shown.length - 1][0] : null;
    shown.forEach(([n, sec, fill], i) => {
      const fr = [sl + 4 + i * fw, stp + 12, fw - 4, sh - 24];
      P.fillRR(fr, 2, n === latest && st.playing ? WHITE : PAPER);
      for (const [pos, row, vel] of bar(n, sec, fill)) {
        P.circle(fr[0] + 2 + Math.min(1, Math.max(0, pos) / 4) * (fr[2] - 4), fr[1] + ROW[row] * fr[3], .8 + vel / 127 * 1.4, ROWC[row]);
      }
      if ((n + 1) % 4 === 1) P.text(fr[0] + 1, fr[1] - 1, 'lb', String(n + 1), 'comic', 8.5, PAPER_DARK);
    });
    if (!shown.length) P.text(sl + sw / 2, stp + sh / 2, 'cc', 'EVERYTHING BRUNO PLAYS LANDS HERE', 'titan', 14, alpha(PAPER, .6));
    const side = RECTS.takeside, range = st.takeBars.length ? `BARS ${st.takeBars[0][0] + 1}–${latest + 1}` : 'EMPTY';
    P.text(side[0] + side[2] / 2, side[1] + 8, 'cc', range, 'titan', 14, INK);
    P.button(RECTS.dragme, 'DRAG ME', MUSTARD, false, 14, hov(st, 'dragme'), prs(st, 'dragme'));
    P.button(RECTS.clear, 'CLEAR', PAPER_DARK, false, 12, hov(st, 'clear'), prs(st, 'clear'));
  }

  function tempoPanel(st) {
    P.panel(RECTS.tempo, 'TEMPO', TEAL);
    P.segments(RECTS.tempoSrc, ['HOST', 'SET'], st.tempoSrc === 'SET' ? 1 : 0, TEAL, 13);
    const factor = st.speed === 'HALF' ? .5 : st.speed === 'DOUBLE' ? 2 : 1;
    const text = st.tempoSrc === 'HOST' ? String(Math.round(st.bpm / factor)) : st.setBpm.toFixed(1);
    P.dragBox(RECTS.bpm, text, 18, hov(st, 'bpm') || prs(st, 'bpm'));
    P.segments(RECTS.speed, ['HALF', 'NORMAL', 'DOUBLE'], ['HALF', 'NORMAL', 'DOUBLE'].indexOf(st.speed), TEAL, 12);
  }

  function feelPanel(st) {
    const r = RECTS.phrasing, x = r[0] + 12;
    P.panel(r, 'PHRASING', RED);
    P.caption(x + 2, r[1] + 30, 'BARS');
    P.segments(RECTS.bars, ['4', '8', '16'], [4, 8, 16].indexOf(st.phrase), RED, 14);
    P.caption(x + 2, r[1] + 68, 'START');
    P.segments(RECTS.launch, ['NOW', 'BEAT', 'BAR'], ['NOW', 'BEAT', 'BAR'].indexOf(st.launch), RED, 12);
  }

  function keysPanel(st) {
    const r = RECTS.keys, x = r[0] + 12, b = st.keyNote;
    P.panel(r, 'KEYSWITCHES', MUSTARD);
    P.caption(x + 2, r[1] + 26, 'FROM');
    P.dragBox(RECTS.keyFrom, noteName(b), 16, hov(st, 'keyFrom'));
    P.caption(x + 72, r[1] + 26, 'CHANNEL');
    P.dragBox(RECTS.keyCh, st.keyChannel ? String(st.keyChannel) : 'ANY', 16, hov(st, 'keyCh'));
    [`${noteName(b)}  START / STOP`, `${noteName(b + 1)}  FILL`, `${noteName(b + 2)}–${noteName(b + 9)}  SECTIONS`]
      .forEach((l, i) => P.text(x + 142, r[1] + 24 + i * 17, 'lc', l, 'comic', 12, INK));
    P.text(x + 2, r[1] + r[3] - 14, 'lc', st.lastKey >= 0 ? `Last heard: ${noteName(st.lastKey)}` : 'Nothing heard yet', 'comic', 11, alpha(INK, .6));
  }

  function outputPanel(st) {
    P.panel(RECTS.output, 'OUTPUT', RED);
    P.dragBox(RECTS.chan, `CH ${st.channel}`, 13, hov(st, 'chan'));
    P.dragBox(RECTS.vel, `${Math.round(st.velocity * 100)}%`, 13, hov(st, 'vel'));
    P.button(RECTS.map, 'MAP', TEAL, st.mapOpen, 13, hov(st, 'map'), prs(st, 'map'));
    const port = RECTS.port, label = !st.port ? 'HOST ONLY' : st.port === 'VIRTUAL' ? '+ VIRTUAL PORT' : '+ ' + st.port.toUpperCase();
    P.card(port, 8, hov(st, 'port') ? WHITE : PAPER, 3);
    P.text(port[0] + 10, port[1] + port[3] / 2 + 1, 'lc', label, 'titan', 12, INK);
    const tx = port[0] + port[2] - 12, ty = port[1] + port[3] / 2;
    P.poly([[tx - 5, ty - 3], [tx + 5, ty - 3], [tx, ty + 4]], INK);
    const led = st.port && st.playing && feel(st).energy > .25;
    P.circle(tx - 16, ty, 5, INK); P.circle(tx - 16, ty, 3.5, led ? ORANGE : RED_DARK);
  }

  function kitPanel(st) {
    P.panel(RECTS.kit, 'KIT', TEAL);
    P.segments(RECTS.kitsegs, ['OFF', 'DRUMS'], st.kit === 'DRUMS' ? 1 : 0, TEAL, 12);
    P.slider(RECTS.vol, TEAL, st.vol);
  }

  function portMenu(st) {
    if (!st.portsOpen) return;
    const items = [['', 'HOST ONLY'], ['VIRTUAL', 'VIRTUAL PORT "Bruno"'], ['IAC Driver Bus 1', 'IAC DRIVER BUS 1']];
    const h = 30 * items.length + 12, w = 300, at = [950 - w, 668 - h - 4];
    P.card([at[0], at[1], w, h], 10, PAPER, 5);
    items.forEach(([v, label], i) => {
      const r = [at[0] + 6, at[1] + 6 + 30 * i, w - 12, 28];
      if (v === st.port) P.fillRR(r, 6, MUSTARD); else if (st.portHover === i) P.fillRR(r, 6, PAPER_DARK);
      P.text(r[0] + 10, r[1] + 15, 'lc', label, 'titan', 13, INK);
    });
  }

  function noteMap(st) {
    if (!st.mapOpen) return;
    const r = RECTS.notemap, [L, T, w, h] = r;
    P.panel(r, 'NOTE MAP', TEAL);
    P.text(L + 18, T + 26, 'lc', 'Which note each drum goes out on. Drag a note, or click ‹ ›.', 'comic', 13, alpha(INK, .8));
    const notes = Object.assign(LANES.map(l => l[1]), st.notes || {}), per = Math.ceil(LANES.length / 2);
    LANES.forEach(([name, gm], i) => {
      const col = Math.floor(i / per), row = i % per, y = T + 50 + row * 36, x = L + 18 + col * 272, n = notes[i];
      P.text(x, y + 14, 'lc', name, 'titan', 14, INK);
      P.button([x + 108, y, 26, 28], '‹', PAPER_DARK, false, 16, st.hover === 'minus' + i);
      P.card([x + 138, y, 82, 28], 7, n === gm ? PAPER : WHITE, 2.5);
      P.text(x + 179, y + 15, 'cc', `${n} · ${noteName(n)}`, 'titan', 13, INK);
      P.button([x + 224, y, 26, 28], '›', PAPER_DARK, false, 16, st.hover === 'plus' + i);
    });
    P.button([L + 18, T + h - 46, 170, 32], 'GENERAL MIDI', MUSTARD, false, 14, hov(st, 'gm'));
    P.button([L + w - 118, T + h - 46, 100, 32], 'DONE', RED, true, 15, hov(st, 'done'), prs(st, 'done'));
  }

  return {
    W, H, el: cv, ready, setScale, draw,
    get scale() { return scale; },
    rect: name => (RECTS[name] || RECTS.window).slice(),
    ctr: name => { const r = RECTS[name] || RECTS.window; return [r[0] + r[2] / 2, r[1] + r[3] / 2]; },
    seg: (name, k, n) => { const r = RECTS[name]; return [r[0] + r[2] * (k + .5) / n, r[1] + r[3] / 2]; },
    padAt: (x, y) => { const p = RECTS.pad; return [p[0] + x * p[2], p[1] + p[3] - y * p[3]]; },
    base: () => JSON.parse(JSON.stringify(BASE)),
  };
}
BrunoWindow.SECTIONS = SECTIONS;
BrunoWindow.noteName = noteName;
BrunoWindow.W = W; BrunoWindow.H = H;
G.BrunoWindow = BrunoWindow;
})(typeof window !== 'undefined' ? window : globalThis);
