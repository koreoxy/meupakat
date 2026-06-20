// src/lib/dictionary.ts

export interface DictionaryEntry {
  word: string;          // English word
  indonesianWord: string; // Indonesian equivalent
  phonetic: string;      // IPA phonetic
  partOfSpeech: string;  // noun, verb, adjective, etc.
  definitionEn: string;  // English definition
  definitionId: string;  // Indonesian definition
  exampleEn: string;     // English example
  exampleId: string;     // Indonesian translation of the example
}

export const offlineDictionary: DictionaryEntry[] = [
  // A
  {
    word: 'ability',
    indonesianWord: 'kemampuan',
    phonetic: '/əˈbɪl.ə.ti/',
    partOfSpeech: 'noun',
    definitionEn: 'The physical or mental power or skill needed to do something.',
    definitionId: 'Kekuatan atau keterampilan fisik atau mental yang dibutuhkan untuk melakukan sesuatu.',
    exampleEn: 'She has the ability to speak three languages fluently.',
    exampleId: 'Dia memiliki kemampuan untuk berbicara tiga bahasa dengan lancar.'
  },
  {
    word: 'accomplish',
    indonesianWord: 'menyelesaikan',
    phonetic: '/əˈkʌm.plɪʃ/',
    partOfSpeech: 'verb',
    definitionEn: 'To succeed in doing something good or completing a task.',
    definitionId: 'Berhasil melakukan sesuatu yang baik atau menyelesaikan suatu tugas.',
    exampleEn: 'You can accomplish anything if you work hard.',
    exampleId: 'Anda bisa menyelesaikan apa saja jika Anda bekerja keras.'
  },
  {
    word: 'active',
    indonesianWord: 'aktif',
    phonetic: '/ˈæk.tɪv/',
    partOfSpeech: 'adjective',
    definitionEn: 'Busy with or constantly doing many activities.',
    definitionId: 'Sibuk dengan atau terus-menerus melakukan banyak kegiatan.',
    exampleEn: 'She is very active in sports and school organizations.',
    exampleId: 'Dia sangat aktif dalam olahraga dan organisasi sekolah.'
  },
  {
    word: 'advice',
    indonesianWord: 'nasihat',
    phonetic: '/ədˈvaɪs/',
    partOfSpeech: 'noun',
    definitionEn: 'An opinion or recommendation offered as a guide for action.',
    definitionId: 'Pendapat atau rekomendasi yang ditawarkan sebagai panduan untuk bertindak.',
    exampleEn: 'I need some advice on which career path to choose.',
    exampleId: 'Saya butuh nasihat tentang jalur karir mana yang harus dipilih.'
  },
  {
    word: 'amazing',
    indonesianWord: 'luar biasa',
    phonetic: '/əˈmeɪ.zɪŋ/',
    partOfSpeech: 'adjective',
    definitionEn: 'Causing great surprise or wonder; astonishing.',
    definitionId: 'Menyebabkan kejutan atau keheranan yang besar; sangat mengagumkan.',
    exampleEn: 'The view from the top of the mountain was amazing.',
    exampleId: 'Pemandangan dari puncak gunung itu sangat luar biasa.'
  },

  // B
  {
    word: 'beautiful',
    indonesianWord: 'indah',
    phonetic: '/ˈbjuː.tɪ.fəl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Pleasing the senses or mind aesthetically.',
    definitionId: 'Menyenangkan indra atau pikiran secara estetika; cantik atau elok.',
    exampleEn: 'The garden has many beautiful flowers.',
    exampleId: 'Taman itu memiliki banyak bunga yang indah.'
  },
  {
    word: 'believe',
    indonesianWord: 'percaya',
    phonetic: '/bɪˈliːv/',
    partOfSpeech: 'verb',
    definitionEn: 'Accept that something is true or feel sure of the truth of.',
    definitionId: 'Menerima bahwa sesuatu itu benar atau merasa yakin akan kebenaran dari sesuatu.',
    exampleEn: 'You must believe in yourself to succeed.',
    exampleId: 'Anda harus percaya pada diri sendiri untuk sukses.'
  },
  {
    word: 'benefit',
    indonesianWord: 'manfaat',
    phonetic: '/ˈben.ɪ.fɪt/',
    partOfSpeech: 'noun',
    definitionEn: 'An advantage or profit gained from something.',
    definitionId: 'Keuntungan atau kegunaan yang diperoleh dari sesuatu.',
    exampleEn: 'Regular exercise has many health benefits.',
    exampleId: 'Olahraga teratur memiliki banyak manfaat kesehatan.'
  },
  {
    word: 'brave',
    indonesianWord: 'berani',
    phonetic: '/breɪv/',
    partOfSpeech: 'adjective',
    definitionEn: 'Ready to face and endure danger or pain; showing courage.',
    definitionId: 'Siap menghadapi dan menanggung bahaya atau rasa sakit; menunjukkan keberanian.',
    exampleEn: 'The brave firefighter rescued the cat from the tree.',
    exampleId: 'Petugas pemadam kebakaran yang berani itu menyelamatkan kucing dari pohon.'
  },
  {
    word: 'busy',
    indonesianWord: 'sibuk',
    phonetic: '/ˈbɪz.i/',
    partOfSpeech: 'adjective',
    definitionEn: 'Having a great deal to do; keeping occupied.',
    definitionId: 'Memiliki banyak hal yang harus dilakukan; tetap terisi waktunya.',
    exampleEn: 'He is always busy preparing for his weekly exams.',
    exampleId: 'Dia selalu sibuk mempersiapkan ujian mingguannya.'
  },

  // C
  {
    word: 'careful',
    indonesianWord: 'hati-hati',
    phonetic: '/ˈkeə.fəl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Making sure of avoiding danger, mistakes, or damage.',
    definitionId: 'Memastikan untuk menghindari bahaya, kesalahan, atau kerusakan.',
    exampleEn: 'Please be careful when driving in the heavy rain.',
    exampleId: 'Harap berhati-hati saat berkendara di tengah hujan lebat.'
  },
  {
    word: 'challenge',
    indonesianWord: 'tantangan',
    phonetic: '/ˈtʃæl.ɪndʒ/',
    partOfSpeech: 'noun',
    definitionEn: 'A call to take part in a contest or a task that tests abilities.',
    definitionId: 'Ajakan untuk berpartisipasi dalam kontes atau tugas yang menguji kemampuan.',
    exampleEn: 'Learning a new language is a great challenge.',
    exampleId: 'Belajar bahasa baru adalah tantangan yang besar.'
  },
  {
    word: 'change',
    indonesianWord: 'mengubah',
    phonetic: '/tʃeɪndʒ/',
    partOfSpeech: 'verb',
    definitionEn: 'Make or become different.',
    definitionId: 'Membuat atau menjadi berbeda dari sebelumnya.',
    exampleEn: 'You cannot change your past, but you can shape your future.',
    exampleId: 'Anda tidak dapat mengubah masa lalu Anda, tetapi Anda dapat membentuk masa depan Anda.'
  },
  {
    word: 'clever',
    indonesianWord: 'pintar',
    phonetic: '/ˈklev.ər/',
    partOfSpeech: 'adjective',
    definitionEn: 'Quick to understand, learn, and devise ideas; intelligent.',
    definitionId: 'Cepat memahami, belajar, dan memikirkan ide; cerdas.',
    exampleEn: 'The clever dog learned to open the door by itself.',
    exampleId: 'Anjing pintar itu belajar membuka pintu sendiri.'
  },
  {
    word: 'curious',
    indonesianWord: 'penasaran',
    phonetic: '/ˈkjʊə.ri.əs/',
    partOfSpeech: 'adjective',
    definitionEn: 'Eager to know or learn something.',
    definitionId: 'Sangat ingin tahu atau mempelajari sesuatu.',
    exampleEn: 'Children are naturally curious about the world around them.',
    exampleId: 'Anak-anak secara alami penasaran tentang dunia di sekitar mereka.'
  },

  // D
  {
    word: 'danger',
    indonesianWord: 'bahaya',
    phonetic: '/ˈdeɪn.dʒər/',
    partOfSpeech: 'noun',
    definitionEn: 'The possibility of suffering harm or injury.',
    definitionId: 'Kemungkinan menderita kerugian, kerusakan, atau cedera.',
    exampleEn: 'The warning sign indicates danger ahead.',
    exampleId: 'Tanda peringatan menunjukkan bahaya di depan.'
  },
  {
    word: 'decide',
    indonesianWord: 'memutuskan',
    phonetic: '/dɪˈsaɪd/',
    partOfSpeech: 'verb',
    definitionEn: 'Come to a resolution in the mind as a result of consideration.',
    definitionId: 'Mengambil keputusan dalam pikiran sebagai hasil pertimbangan.',
    exampleEn: 'I need to decide which university to attend.',
    exampleId: 'Saya harus memutuskan universitas mana yang akan dimasuki.'
  },
  {
    word: 'delicious',
    indonesianWord: 'lezat',
    phonetic: '/dɪˈlɪʃ.əs/',
    partOfSpeech: 'adjective',
    definitionEn: 'Highly pleasant to the taste.',
    definitionId: 'Sangat menyenangkan bagi indra pengecap; enak sekali.',
    exampleEn: 'My mother made a delicious chocolate cake.',
    exampleId: 'Ibu saya membuat kue cokelat yang lezat.'
  },
  {
    word: 'describe',
    indonesianWord: 'menggambarkan',
    phonetic: '/dɪˈskraɪb/',
    partOfSpeech: 'verb',
    definitionEn: 'Give a detailed account in words of someone or something.',
    definitionId: 'Memberikan penjelasan terperinci dengan kata-kata tentang seseorang atau sesuatu.',
    exampleEn: 'Can you describe the person you saw at the shop?',
    exampleId: 'Bisakah Anda menggambarkan orang yang Anda lihat di toko?'
  },
  {
    word: 'difficult',
    indonesianWord: 'sulit',
    phonetic: '/ˈdɪf.ɪ.kəlt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Needing much effort or skill to accomplish, deal with, or understand.',
    definitionId: 'Membutuhkan banyak usaha atau keterampilan untuk dicapai, dihadapi, atau dipahami.',
    exampleEn: 'This math test is very difficult.',
    exampleId: 'Ujian matematika ini sangat sulit.'
  },

  // E
  {
    word: 'easy',
    indonesianWord: 'mudah',
    phonetic: '/ˈiː.zi/',
    partOfSpeech: 'adjective',
    definitionEn: 'Achieved without great effort; presenting few difficulties.',
    definitionId: 'Dicapai tanpa usaha keras; menyajikan sedikit kesulitan.',
    exampleEn: 'Cooking instant noodles is very easy.',
    exampleId: 'Memasak mi instan sangatlah mudah.'
  },
  {
    word: 'education',
    indonesianWord: 'pendidikan',
    phonetic: '/ˌed.jʊˈkeɪ.ʃən/',
    partOfSpeech: 'noun',
    definitionEn: 'The process of receiving or giving systematic instruction, especially at a school.',
    definitionId: 'Proses menerima atau memberikan instruksi sistematis, terutama di sekolah.',
    exampleEn: 'Education is the key to a better future.',
    exampleId: 'Pendidikan adalah kunci untuk masa depan yang lebih baik.'
  },
  {
    word: 'effort',
    indonesianWord: 'usaha',
    phonetic: '/ˈef.ət/',
    partOfSpeech: 'noun',
    definitionEn: 'A vigorous or determined attempt to achieve something.',
    definitionId: 'Upaya yang kuat atau penuh tekad untuk mencapai sesuatu.',
    exampleEn: 'He put a lot of effort into passing the final test.',
    exampleId: 'Dia mengerahkan banyak usaha untuk lulus ujian akhir.'
  },
  {
    word: 'elegant',
    indonesianWord: 'elegan',
    phonetic: '/ˈel.ɪ.ɡənt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Graceful and stylish in appearance or manner.',
    definitionId: 'Anggun, elok, dan bergaya dalam penampilan atau sikap.',
    exampleEn: 'She wore an elegant dress to the formal dinner.',
    exampleId: 'Dia mengenakan gaun yang elegan ke makan malam formal.'
  },
  {
    word: 'enough',
    indonesianWord: 'cukup',
    phonetic: '/ɪˈnʌf/',
    partOfSpeech: 'adjective',
    definitionEn: 'As much or as many as required.',
    definitionId: 'Sebanyak yang diperlukan atau disyaratkan.',
    exampleEn: 'We have enough food to feed everyone in the room.',
    exampleId: 'Kita memiliki cukup makanan untuk memberi makan semua orang di ruangan.'
  },

  // F
  {
    word: 'famous',
    indonesianWord: 'terkenal',
    phonetic: '/ˈfeɪ.məs/',
    partOfSpeech: 'adjective',
    definitionEn: 'Known about by many people.',
    definitionId: 'Dikenal luas oleh banyak orang; populer.',
    exampleEn: 'Bali is famous for its beautiful sandy beaches.',
    exampleId: 'Bali terkenal dengan pantai pasir putihnya yang indah.'
  },
  {
    word: 'feeling',
    indonesianWord: 'perasaan',
    phonetic: '/ˈfiː.lɪŋ/',
    partOfSpeech: 'noun',
    definitionEn: 'An emotional state or reaction.',
    definitionId: 'Keadaan atau reaksi emosional seseorang.',
    exampleEn: 'I have a good feeling about this project.',
    exampleId: 'Saya memiliki perasaan yang baik tentang proyek ini.'
  },
  {
    word: 'focus',
    indonesianWord: 'fokus',
    phonetic: '/ˈfəʊ.kəs/',
    partOfSpeech: 'verb',
    definitionEn: 'Pay particular attention to one thing.',
    definitionId: 'Memberikan perhatian khusus pada satu hal.',
    exampleEn: 'You must focus on the screen to read the text.',
    exampleId: 'Anda harus fokus pada layar untuk membaca teks.'
  },
  {
    word: 'forget',
    indonesianWord: 'lupa',
    phonetic: '/fəˈɡet/',
    partOfSpeech: 'verb',
    definitionEn: 'Fail to remember.',
    definitionId: 'Gagal mengingat kembali apa yang telah diketahui.',
    exampleEn: 'Do not forget to turn off the lights before sleeping.',
    exampleId: 'Jangan lupa mematikan lampu sebelum tidur.'
  },
  {
    word: 'future',
    indonesianWord: 'masa depan',
    phonetic: '/ˈfjuː.tʃər/',
    partOfSpeech: 'noun',
    definitionEn: 'The time or a period of time following the moment of speaking or writing.',
    definitionId: 'Waktu atau periode waktu setelah momen berbicara atau menulis.',
    exampleEn: 'We should plan carefully for our future.',
    exampleId: 'Kita harus merencanakan masa depan kita dengan matang.'
  },

  // G
  {
    word: 'generous',
    indonesianWord: 'dermawan',
    phonetic: '/ˈdʒen.ər.əs/',
    partOfSpeech: 'adjective',
    definitionEn: 'Showing a readiness to give more of something, especially money, than is strictly necessary.',
    definitionId: 'Menunjukkan kesiapan untuk memberi lebih banyak sesuatu, terutama uang atau bantuan.',
    exampleEn: 'He is generous with his money, always donating to charities.',
    exampleId: 'Dia dermawan dengan uangnya, selalu menyumbang ke badan amal.'
  },
  {
    word: 'gentle',
    indonesianWord: 'lembut',
    phonetic: '/ˈdʒen.təl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Mild in temperament or behavior; kind or tender.',
    definitionId: 'Ringan dalam temperamen atau perilaku; baik hati atau tidak kasar.',
    exampleEn: 'She gave the crying child a gentle hug.',
    exampleId: 'Dia memeluk anak yang menangis itu dengan lembut.'
  },
  {
    word: 'give',
    indonesianWord: 'memberikan',
    phonetic: '/ɡɪv/',
    partOfSpeech: 'verb',
    definitionEn: 'Freely transfer the possession of something to someone.',
    definitionId: 'Mentransfer kepemilikan sesuatu kepada seseorang secara sukarela.',
    exampleEn: 'Please give this book to your English teacher.',
    exampleId: 'Tolong berikan buku ini kepada guru bahasa Inggrismu.'
  },
  {
    word: 'goal',
    indonesianWord: 'tujuan',
    phonetic: '/ɡəʊl/',
    partOfSpeech: 'noun',
    definitionEn: 'The object of a person\'s ambition or effort; an aim or desired result.',
    definitionId: 'Objek dari ambisi atau usaha seseorang; tujuan atau hasil yang diinginkan.',
    exampleEn: 'My goal is to achieve business success in five years.',
    exampleId: 'Tujuan saya adalah mencapai kesuksesan bisnis dalam lima tahun.'
  },
  {
    word: 'great',
    indonesianWord: 'hebat',
    phonetic: '/ɡreɪt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Of an extent, amount, or intensity considerably above the average.',
    definitionId: 'Berada pada tingkat ukuran, jumlah, atau intensitas jauh di atas rata-rata.',
    exampleEn: 'This movie is a great masterpiece.',
    exampleId: 'Film ini adalah mahakarya yang hebat.'
  },

  // H
  {
    word: 'habit',
    indonesianWord: 'kebiasaan',
    phonetic: '/ˈhæb.ɪt/',
    partOfSpeech: 'noun',
    definitionEn: 'A settled or regular tendency or practice, especially one that is hard to give up.',
    definitionId: 'Kecenderungan atau kebiasaan rutin yang mapan, terutama yang sulit dihentikan.',
    exampleEn: 'Reading books is a good habit to develop.',
    exampleId: 'Membaca buku adalah kebiasaan baik untuk dikembangkan.'
  },
  {
    word: 'happy',
    indonesianWord: 'bahagia',
    phonetic: '/ˈhæp.i/',
    partOfSpeech: 'adjective',
    definitionEn: 'Feeling or showing pleasure or contentment.',
    definitionId: 'Merasakan atau menunjukkan kesenangan atau kepuasan hati.',
    exampleEn: 'The children looked happy playing in the park.',
    exampleId: 'Anak-anak tampak bahagia bermain di taman.'
  },
  {
    word: 'healthy',
    indonesianWord: 'sehat',
    phonetic: '/ˈhel.θi/',
    partOfSpeech: 'adjective',
    definitionEn: 'In a good physical or mental condition; not diseased.',
    definitionId: 'Dalam kondisi fisik atau mental yang baik; terbebas dari penyakit.',
    exampleEn: 'Eating vegetables keeps your body healthy.',
    exampleId: 'Makan sayur menjaga tubuh Anda tetap sehat.'
  },
  {
    word: 'help',
    indonesianWord: 'membantu',
    phonetic: '/help/',
    partOfSpeech: 'verb',
    definitionEn: 'Make it easier for someone to do something by offering services or resources.',
    definitionId: 'Membuat seseorang lebih mudah melakukan sesuatu dengan menawarkan bantuan.',
    exampleEn: 'I am always happy to help my friends with their homework.',
    exampleId: 'Saya selalu senang membantu teman-teman saya dengan pekerjaan rumah mereka.'
  },
  {
    word: 'honest',
    indonesianWord: 'jujur',
    phonetic: '/ˈɒn.ɪst/',
    partOfSpeech: 'adjective',
    definitionEn: 'Free of deceit; truthful and sincere.',
    definitionId: 'Bebas dari penipuan; benar dan tulus apa adanya.',
    exampleEn: 'An honest student does not cheat during exams.',
    exampleId: 'Siswa yang jujur tidak mencontek saat ujian.'
  },

  // I
  {
    word: 'idea',
    indonesianWord: 'ide',
    phonetic: '/aɪˈdɪə/',
    partOfSpeech: 'noun',
    definitionEn: 'A thought or suggestion as to a possible course of action.',
    definitionId: 'Sebuah pemikiran atau saran mengenai tindakan yang mungkin dilakukan.',
    exampleEn: 'I have a great idea for our school project.',
    exampleId: 'Saya punya ide bagus untuk proyek sekolah kita.'
  },
  {
    word: 'important',
    indonesianWord: 'penting',
    phonetic: '/ɪmˈpɔː.tənt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Of great significance or value; likely to have a profound effect.',
    definitionId: 'Memiliki signifikansi atau nilai yang besar; sangat berpengaruh.',
    exampleEn: 'It is important to drink water every single day.',
    exampleId: 'Sangat penting untuk minum air setiap hari.'
  },
  {
    word: 'improve',
    indonesianWord: 'meningkatkan',
    phonetic: '/ɪmˈpruːv/',
    partOfSpeech: 'verb',
    definitionEn: 'Make or become better.',
    definitionId: 'Membuat atau menjadi lebih baik dari sebelumnya.',
    exampleEn: 'You can improve your English by practicing daily.',
    exampleId: 'Anda dapat meningkatkan kemampuan bahasa Inggris Anda dengan berlatih setiap hari.'
  },
  {
    word: 'information',
    indonesianWord: 'informasi',
    phonetic: '/ˌɪn.fəˈmeɪ.ʃən/',
    partOfSpeech: 'noun',
    definitionEn: 'Facts provided or learned about something or someone.',
    definitionId: 'Fakta yang diberikan atau dipelajari tentang sesuatu atau seseorang.',
    exampleEn: 'You can find more information on our official website.',
    exampleId: 'Anda dapat menemukan informasi lebih lanjut di situs web resmi kami.'
  },
  {
    word: 'interest',
    indonesianWord: 'ketertarikan',
    phonetic: '/ˈɪn.trəst/',
    partOfSpeech: 'noun',
    definitionEn: 'The state of wanting to know or learn about something or someone.',
    definitionId: 'Keinginan untuk mengetahui atau mempelajari sesuatu atau seseorang.',
    exampleEn: 'He showed a keen interest in historical studies.',
    exampleId: 'Dia menunjukkan ketertarikan yang tinggi dalam studi sejarah.'
  },

  // J
  {
    word: 'job',
    indonesianWord: 'pekerjaan',
    phonetic: '/dʒɒb/',
    partOfSpeech: 'noun',
    definitionEn: 'A paid position of regular employment.',
    definitionId: 'Posisi berbayar dari pekerjaan rutin.',
    exampleEn: 'She found a new job as a graphic designer.',
    exampleId: 'Dia menemukan pekerjaan baru sebagai desainer grafis.'
  },
  {
    word: 'journey',
    indonesianWord: 'perjalanan',
    phonetic: '/ˈdʒɜː.ni/',
    partOfSpeech: 'noun',
    definitionEn: 'An act of traveling from one place to another.',
    definitionId: 'Tindakan bepergian dari satu tempat ke tempat lain.',
    exampleEn: 'The journey to the village took five hours.',
    exampleId: 'Perjalanan ke desa tersebut memakan waktu lima jam.'
  },
  {
    word: 'joy',
    indonesianWord: 'kegembiraan',
    phonetic: '/dʒɔɪ/',
    partOfSpeech: 'noun',
    definitionEn: 'A feeling of great pleasure and happiness.',
    definitionId: 'Perasaan senang dan bahagia yang besar.',
    exampleEn: 'The children brought much joy to the family.',
    exampleId: 'Anak-anak membawa banyak kegembiraan bagi keluarga.'
  },
  {
    word: 'justice',
    indonesianWord: 'keadilan',
    phonetic: '/ˈdʒʌs.tɪs/',
    partOfSpeech: 'noun',
    definitionEn: 'Just behavior or treatment.',
    definitionId: 'Perilaku atau perlakuan yang adil.',
    exampleEn: 'The judge is dedicated to bringing justice to all.',
    exampleId: 'Hakim berdedikasi untuk menegakkan keadilan bagi semua.'
  },

  // K
  {
    word: 'keep',
    indonesianWord: 'menjaga',
    phonetic: '/kiːp/',
    partOfSpeech: 'verb',
    definitionEn: 'Have or retain possession of; protect.',
    definitionId: 'Memiliki atau mempertahankan kepemilikan atas sesuatu; merawat atau melindungi.',
    exampleEn: 'Please keep this secret between us.',
    exampleId: 'Tolong jaga rahasia ini di antara kita saja.'
  },
  {
    word: 'key',
    indonesianWord: 'kunci',
    phonetic: '/kiː/',
    partOfSpeech: 'noun',
    definitionEn: 'A small piece of shaped metal used to open a lock; an essential thing.',
    definitionId: 'Sepotong logam kecil berbentuk khusus untuk membuka gembok; hal yang esensial.',
    exampleEn: 'Hard work is the key to unlocking success.',
    exampleId: 'Kerja keras adalah kunci untuk membuka pintu kesuksesan.'
  },
  {
    word: 'kind',
    indonesianWord: 'baik hati',
    phonetic: '/kaɪnd/',
    partOfSpeech: 'adjective',
    definitionEn: 'Having or showing a friendly, generous, and considerate nature.',
    definitionId: 'Memiliki atau menunjukkan sifat ramah, dermawan, dan penuh perhatian.',
    exampleEn: 'Thank you for your kind help today.',
    exampleId: 'Terima kasih atas bantuan baik hatimu hari ini.'
  },
  {
    word: 'knowledge',
    indonesianWord: 'pengetahuan',
    phonetic: '/ˈnɒl.ɪdʒ/',
    partOfSpeech: 'noun',
    definitionEn: 'Facts, information, and skills acquired through experience or education.',
    definitionId: 'Fakta, informasi, dan keterampilan yang diperoleh melalui pengalaman atau pendidikan.',
    exampleEn: 'Sharing knowledge helps everyone grow.',
    exampleId: 'Berbagi pengetahuan membantu semua orang tumbuh.'
  },

  // L
  {
    word: 'language',
    indonesianWord: 'bahasa',
    phonetic: '/ˈlæŋ.ɡwɪdʒ/',
    partOfSpeech: 'noun',
    definitionEn: 'The system of communication used by a particular community or country.',
    definitionId: 'Sistem komunikasi yang digunakan oleh komunitas atau negara tertentu.',
    exampleEn: 'English is used as an international language.',
    exampleId: 'Bahasa Inggris digunakan sebagai bahasa internasional.'
  },
  {
    word: 'large',
    indonesianWord: 'besar',
    phonetic: '/lɑːdʒ/',
    partOfSpeech: 'adjective',
    definitionEn: 'Of relatively great size or extent.',
    definitionId: 'Memiliki ukuran atau tingkat yang relatif besar.',
    exampleEn: 'They live in a large house in Jakarta.',
    exampleId: 'Mereka tinggal di rumah yang besar di Jakarta.'
  },
  {
    word: 'learn',
    indonesianWord: 'belajar',
    phonetic: '/lɜːn/',
    partOfSpeech: 'verb',
    definitionEn: 'Gain or acquire knowledge of or skill in something by study or experience.',
    definitionId: 'Memperoleh pengetahuan atau keterampilan dalam sesuatu melalui pelajaran atau pengalaman.',
    exampleEn: 'I want to learn how to play the piano.',
    exampleId: 'Saya ingin belajar cara bermain piano.'
  },
  {
    word: 'library',
    indonesianWord: 'perpustakaan',
    phonetic: '/ˈlaɪ.brər.i/',
    partOfSpeech: 'noun',
    definitionEn: 'A building or room containing collections of books for reading.',
    definitionId: 'Bangunan atau ruangan yang berisi koleksi buku untuk dibaca.',
    exampleEn: 'I borrowed a history book from the local library.',
    exampleId: 'Saya meminjam buku sejarah dari perpustakaan setempat.'
  },
  {
    word: 'listen',
    indonesianWord: 'mendengarkan',
    phonetic: '/ˈlɪs.ən/',
    partOfSpeech: 'verb',
    definitionEn: 'Give one\'s attention to a sound.',
    definitionId: 'Memberikan perhatian penuh pada suara yang terdengar.',
    exampleEn: 'You should listen to the English dialogues carefully.',
    exampleId: 'Anda harus mendengarkan dialog bahasa Inggris itu dengan teliti.'
  },

  // M
  {
    word: 'main',
    indonesianWord: 'utama',
    phonetic: '/meɪn/',
    partOfSpeech: 'adjective',
    definitionEn: 'Chief in size, extent, or importance; principal.',
    definitionId: 'Paling penting, besar, atau berpengaruh; pokok.',
    exampleEn: 'The main ingredient of this cake is cheese.',
    exampleId: 'Bahan utama dari kue ini adalah keju.'
  },
  {
    word: 'make',
    indonesianWord: 'membuat',
    phonetic: '/meɪk/',
    partOfSpeech: 'verb',
    definitionEn: 'Create or produce something.',
    definitionId: 'Menciptakan atau memproduksi sesuatu.',
    exampleEn: 'My grandmother makes delicious cakes.',
    exampleId: 'Nenek saya membuat kue-kue yang lezat.'
  },
  {
    word: 'meaning',
    indonesianWord: 'arti',
    phonetic: '/ˈmiː.nɪŋ/',
    partOfSpeech: 'noun',
    definitionEn: 'What is meant by a word, text, concept, or action.',
    definitionId: 'Apa yang dimaksud oleh suatu kata, teks, konsep, atau tindakan.',
    exampleEn: 'What is the meaning of this English phrase?',
    exampleId: 'Apa arti dari frasa bahasa Inggris ini?'
  },
  {
    word: 'memory',
    indonesianWord: 'ingatan',
    phonetic: '/ˈmem.ər.i/',
    partOfSpeech: 'noun',
    definitionEn: 'The faculty by which the mind stores and remembers information.',
    definitionId: 'Kemampuan pikiran untuk menyimpan dan mengingat informasi.',
    exampleEn: 'I have a great memory for telephone numbers.',
    exampleId: 'Saya memiliki ingatan yang hebat untuk nomor-nomor telepon.'
  },
  {
    word: 'modern',
    indonesianWord: 'modern',
    phonetic: '/ˈmɒd.ən/',
    partOfSpeech: 'adjective',
    definitionEn: 'Relating to the present or recent times as opposed to the remote past.',
    definitionId: 'Berhubungan dengan masa kini atau baru-baru ini sebagai lawan dari masa lalu kuno.',
    exampleEn: 'The city is filled with modern skyscrapers.',
    exampleId: 'Kota ini dipenuhi oleh gedung pencakar langit modern.'
  },

  // N
  {
    word: 'nation',
    indonesianWord: 'bangsa',
    phonetic: '/ˈneɪ.ʃən/',
    partOfSpeech: 'noun',
    definitionEn: 'A large body of people united by common descent, history, culture, or language.',
    definitionId: 'Sekumpulan besar orang yang disatukan oleh asal-usul, sejarah, budaya, atau bahasa yang sama.',
    exampleEn: 'Indonesia is a diverse and rich nation.',
    exampleId: 'Indonesia adalah bangsa yang kaya dan beragam.'
  },
  {
    word: 'natural',
    indonesianWord: 'alami',
    phonetic: '/ˈnætʃ.ər.əl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Existing in or caused by nature; not made by humankind.',
    definitionId: 'Ada di atau disebabkan oleh alam; tidak dibuat oleh manusia.',
    exampleEn: 'Organic vegetables are made with natural ingredients.',
    exampleId: 'Sayuran organik dibuat dengan bahan-bahan alami.'
  },
  {
    word: 'necessary',
    indonesianWord: 'penting',
    phonetic: '/ˈnes.ə.ser.i/',
    partOfSpeech: 'adjective',
    definitionEn: 'Required to be done, achieved, or present; needed; essential.',
    definitionId: 'Diharuskan untuk dilakukan, dicapai, atau ada; diperlukan sekali; esensial.',
    exampleEn: 'It is necessary to wear a helmet when riding a motorcycle.',
    exampleId: 'Sangat penting untuk menggunakan helm saat mengendarai sepeda motor.'
  },
  {
    word: 'new',
    indonesianWord: 'baru',
    phonetic: '/njuː/',
    partOfSpeech: 'adjective',
    definitionEn: 'Not existing before; made, introduced, or discovered recently.',
    definitionId: 'Belum ada sebelumnya; dibuat, diperkenalkan, atau ditemukan baru-baru ini.',
    exampleEn: 'He bought a new bicycle yesterday.',
    exampleId: 'Dia membeli sepeda baru kemarin.'
  },
  {
    word: 'noble',
    indonesianWord: 'mulia',
    phonetic: '/ˈnəʊ.bəl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Having or showing fine personal qualities or high moral principles.',
    definitionId: 'Memiliki atau menunjukkan kualitas pribadi yang baik atau prinsip moral yang tinggi.',
    exampleEn: 'Helping the poor is a noble deed.',
    exampleId: 'Membantu orang miskin adalah perbuatan yang mulia.'
  },

  // O
  {
    word: 'obtain',
    indonesianWord: 'memperoleh',
    phonetic: '/əbˈteɪn/',
    partOfSpeech: 'verb',
    definitionEn: 'Get, acquire, or secure something.',
    definitionId: 'Mendapatkan, memperoleh, atau mengamankan sesuatu.',
    exampleEn: 'You must obtain a visa before traveling abroad.',
    exampleId: 'Anda harus memperoleh visa sebelum bepergian ke luar negeri.'
  },
  {
    word: 'obvious',
    indonesianWord: 'jelas',
    phonetic: '/ˈɒb.vi.əs/',
    partOfSpeech: 'adjective',
    definitionEn: 'Easily perceived or understood; clear, self-evident, or apparent.',
    definitionId: 'Mudah dipahami atau dirasakan; sangat jelas dan nyata.',
    exampleEn: 'It is obvious that she is telling the truth.',
    exampleId: 'Sangat jelas bahwa dia mengatakan yang sebenarnya.'
  },
  {
    word: 'offer',
    indonesianWord: 'menawarkan',
    phonetic: '/ˈɒf.ər/',
    partOfSpeech: 'verb',
    definitionEn: 'Present or proffer something for someone to accept or reject.',
    definitionId: 'Menyajikan atau menyodorkan sesuatu untuk diterima atau ditolak seseorang.',
    exampleEn: 'He offered to help me carry the heavy box.',
    exampleId: 'Dia menawarkan diri untuk membantuku membawa kotak berat itu.'
  },
  {
    word: 'opportunity',
    indonesianWord: 'kesempatan',
    phonetic: '/ˌɒp.əˈtʃuː.nə.ti/',
    partOfSpeech: 'noun',
    definitionEn: 'A set of circumstances that makes it possible to do something.',
    definitionId: 'Kondisi atau keadaan yang memungkinkan untuk melakukan sesuatu.',
    exampleEn: 'Do not miss this opportunity to study abroad.',
    exampleId: 'Jangan lewatkan kesempatan untuk belajar di luar negeri ini.'
  },
  {
    word: 'original',
    indonesianWord: 'asli',
    phonetic: '/əˈrɪdʒ.ən.əl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Present from the beginning; not a copy.',
    definitionId: 'Ada sejak awal; bukan tiruan atau salinan.',
    exampleEn: 'The original painting is kept in the national museum.',
    exampleId: 'Lukisan asli disimpan di museum nasional.'
  },

  // P
  {
    word: 'pain',
    indonesianWord: 'rasa sakit',
    phonetic: '/peɪn/',
    partOfSpeech: 'noun',
    definitionEn: 'Physical suffering or discomfort caused by illness or injury.',
    definitionId: 'Penderitaan fisik atau ketidaknyamanan yang disebabkan penyakit atau cedera.',
    exampleEn: 'He felt a sharp pain in his left ankle.',
    exampleId: 'Dia merasakan rasa sakit yang tajam di pergelangan kaki kirinya.'
  },
  {
    word: 'patient',
    indonesianWord: 'sabar',
    phonetic: '/ˈpeɪ.ʃənt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Able to accept or tolerate delays, problems, or suffering without becoming annoyed.',
    definitionId: 'Mampu menerima atau mentolerir penundaan, masalah, atau penderitaan tanpa menjadi marah.',
    exampleEn: 'Teachers need to be patient with slow learners.',
    exampleId: 'Guru harus sabar menghadapi siswa yang lambat belajar.'
  },
  {
    word: 'peace',
    indonesianWord: 'perdamaian',
    phonetic: '/piːs/',
    partOfSpeech: 'noun',
    definitionEn: 'Freedom from disturbance; tranquility; state of quiet.',
    definitionId: 'Kebebasan dari gangguan; ketenangan; keadaan damai.',
    exampleEn: 'We all pray for world peace.',
    exampleId: 'Kita semua berdoa untuk perdamaian dunia.'
  },
  {
    word: 'perfect',
    indonesianWord: 'sempurna',
    phonetic: '/ˈpɜː.fekt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Having all the required or desirable elements, qualities, or characteristics.',
    definitionId: 'Memiliki semua elemen, kualitas, atau karakteristik yang disyaratkan atau diinginkan.',
    exampleEn: 'The sunny weather was perfect for a picnic.',
    exampleId: 'Cuaca yang cerah sangat sempurna untuk piknik.'
  },
  {
    word: 'polite',
    indonesianWord: 'sopan',
    phonetic: '/pəˈlaɪt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Having or showing behavior that is respectful and considerate of other people.',
    definitionId: 'Memiliki atau menunjukkan perilaku yang menghormati dan memperhatikan orang lain.',
    exampleEn: 'It is polite to say thank you when you receive help.',
    exampleId: 'Adalah hal yang sopan untuk mengucapkan terima kasih ketika menerima bantuan.'
  },

  // Q
  {
    word: 'quality',
    indonesianWord: 'kualitas',
    phonetic: '/ˈkwɒl.ə.ti/',
    partOfSpeech: 'noun',
    definitionEn: 'The standard of something as measured against other things of a similar kind.',
    definitionId: 'Standar dari sesuatu yang diukur terhadap hal-hal serupa; mutu.',
    exampleEn: 'This factory produces goods of high quality.',
    exampleId: 'Pabrik ini memproduksi barang-barang berkualitas tinggi.'
  },
  {
    word: 'quantity',
    indonesianWord: 'jumlah',
    phonetic: '/ˈkwɒn.tə.ti/',
    partOfSpeech: 'noun',
    definitionEn: 'An amount or number of something.',
    definitionId: 'Kuantitas atau jumlah dari sesuatu.',
    exampleEn: 'They purchased a large quantity of steel.',
    exampleId: 'Mereka membeli baja dalam jumlah besar.'
  },
  {
    word: 'queen',
    indonesianWord: 'ratu',
    phonetic: '/kwiːn/',
    partOfSpeech: 'noun',
    definitionEn: 'The female ruler of an independent state.',
    definitionId: 'Penguasa wanita dari suatu negara merdeka.',
    exampleEn: 'The queen attended the international charity event.',
    exampleId: 'Ratu menghadiri acara amal internasional tersebut.'
  },
  {
    word: 'quick',
    indonesianWord: 'cepat',
    phonetic: '/kwɪk/',
    partOfSpeech: 'adjective',
    definitionEn: 'Moving fast or doing something in a short time.',
    definitionId: 'Bergerak dengan cepat atau melakukan sesuatu dalam waktu singkat.',
    exampleEn: 'She made a quick decision to buy the car.',
    exampleId: 'Dia mengambil keputusan cepat untuk membeli mobil itu.'
  },
  {
    word: 'quiet',
    indonesianWord: 'tenang',
    phonetic: '/ˈkwaɪ.ət/',
    partOfSpeech: 'adjective',
    definitionEn: 'Making little or no noise; peaceful.',
    definitionId: 'Membuat sedikit atau tidak ada suara sama sekali; sunyi atau damai.',
    exampleEn: 'The library is a quiet place to read.',
    exampleId: 'Perpustakaan adalah tempat yang tenang untuk membaca.'
  },

  // R
  {
    word: 'ready',
    indonesianWord: 'siap',
    phonetic: '/ˈred.i/',
    partOfSpeech: 'adjective',
    definitionEn: 'In a suitable state for an activity or situation; fully prepared.',
    definitionId: 'Berada pada kondisi yang sesuai untuk suatu kegiatan; sepenuhnya siap.',
    exampleEn: 'Are you ready for your English speaking test?',
    exampleId: 'Apakah Anda siap untuk tes berbicara bahasa Inggris Anda?'
  },
  {
    word: 'realize',
    indonesianWord: 'menyadari',
    phonetic: '/ˈrɪə.laɪz/',
    partOfSpeech: 'verb',
    definitionEn: 'Become fully aware of something as a fact; understand clearly.',
    definitionId: 'Menjadi sadar sepenuhnya akan sesuatu sebagai fakta; mengerti dengan jelas.',
    exampleEn: 'I did not realize how late it was.',
    exampleId: 'Saya tidak menyadari betapa larutnya waktu itu.'
  },
  {
    word: 'reason',
    indonesianWord: 'alasan',
    phonetic: '/ˈriː.zən/',
    partOfSpeech: 'noun',
    definitionEn: 'A cause, explanation, or justification for an action or event.',
    definitionId: 'Penyebab, penjelasan, atau pembenaran untuk suatu tindakan atau peristiwa.',
    exampleEn: 'Please state your reason for arriving late.',
    exampleId: 'Tolong sebutkan alasan Anda datang terlambat.'
  },
  {
    word: 'recommend',
    indonesianWord: 'rekomendasi',
    phonetic: '/ˌrek.əˈmend/',
    partOfSpeech: 'verb',
    definitionEn: 'Put forward someone or something with approval as being suitable for a purpose.',
    definitionId: 'Menyarankan seseorang atau sesuatu dengan persetujuan karena dinilai cocok.',
    exampleEn: 'I highly recommend this English textbook.',
    exampleId: 'Saya sangat merekomendasikan buku pelajaran bahasa Inggris ini.'
  },
  {
    word: 'respect',
    indonesianWord: 'menghormati',
    phonetic: '/rɪˈspekt/',
    partOfSpeech: 'verb',
    definitionEn: 'Admire someone deeply, as a result of their abilities, qualities, or achievements.',
    definitionId: 'Mengagumi seseorang secara mendalam karena kemampuan, kualitas, atau prestasi mereka.',
    exampleEn: 'We must respect our teachers and parents.',
    exampleId: 'Kita harus menghormati guru dan orang tua kita.'
  },

  // S
  {
    word: 'safe',
    indonesianWord: 'aman',
    phonetic: '/seɪf/',
    partOfSpeech: 'adjective',
    definitionEn: 'Protected from or not exposed to danger or risk; not likely to cause harm.',
    definitionId: 'Terlindungi dari atau tidak terpapar bahaya atau risiko; tidak berbahaya.',
    exampleEn: 'Keep your password in a safe place.',
    exampleId: 'Simpan kata sandi Anda di tempat yang aman.'
  },
  {
    word: 'secret',
    indonesianWord: 'rahasia',
    phonetic: '/ˈsiː.krət/',
    partOfSpeech: 'noun',
    definitionEn: 'Something that is kept or meant to be kept unknown or unseen by others.',
    definitionId: 'Sesuatu yang dijaga agar tidak diketahui atau tidak dilihat oleh orang lain.',
    exampleEn: 'I cannot tell you the code; it is a secret.',
    exampleId: 'Saya tidak bisa memberi tahu Anda kodenya; itu adalah rahasia.'
  },
  {
    word: 'simple',
    indonesianWord: 'sederhana',
    phonetic: '/ˈsɪm.pəl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Easily understood or done; presenting no difficulty.',
    definitionId: 'Mudah dipahami atau dilakukan; tidak menyajikan kesulitan.',
    exampleEn: 'The rules of the game are very simple.',
    exampleId: 'Aturan permainan ini sangat sederhana.'
  },
  {
    word: 'solution',
    indonesianWord: 'solusi',
    phonetic: '/səˈluː.ʃən/',
    partOfSpeech: 'noun',
    definitionEn: 'A means of solving a problem or dealing with a difficult situation.',
    definitionId: 'Cara memecahkan masalah atau menghadapi situasi yang sulit.',
    exampleEn: 'We need to find a solution to this problem.',
    exampleId: 'Kita harus mencari solusi untuk masalah ini.'
  },
  {
    word: 'speak',
    indonesianWord: 'berbicara',
    phonetic: '/spiːk/',
    partOfSpeech: 'verb',
    definitionEn: 'Say something in order to convey information, an opinion, or a feeling.',
    definitionId: 'Mengucapkan sesuatu untuk menyampaikan informasi, pendapat, atau perasaan.',
    exampleEn: 'I want to speak English fluently like a native speaker.',
    exampleId: 'Saya ingin berbicara bahasa Inggris dengan lancar seperti penutur asli.'
  },

  // T
  {
    word: 'task',
    indonesianWord: 'tugas',
    phonetic: '/tɑːsk/',
    partOfSpeech: 'noun',
    definitionEn: 'A piece of work to be done or undertaken.',
    definitionId: 'Pekerjaan atau tanggung jawab yang harus diselesaikan.',
    exampleEn: 'My first task today is to reply to emails.',
    exampleId: 'Tugas pertama saya hari ini adalah membalas email.'
  },
  {
    word: 'teacher',
    indonesianWord: 'guru',
    phonetic: '/ˈtiː.tʃər/',
    partOfSpeech: 'noun',
    definitionEn: 'A person who teaches, especially in a school.',
    definitionId: 'Orang yang mengajar, khususnya di sekolah.',
    exampleEn: 'The English teacher explained the grammar rules clearly.',
    exampleId: 'Guru bahasa Inggris itu menjelaskan aturan tata bahasa dengan jelas.'
  },
  {
    word: 'temporary',
    indonesianWord: 'sementara',
    phonetic: '/ˈtem.pər.ər.i/',
    partOfSpeech: 'adjective',
    definitionEn: 'Lasting for only a limited period of time; not permanent.',
    definitionId: 'Berlangsung hanya untuk periode waktu terbatas; tidak permanen.',
    exampleEn: 'This road closure is only temporary.',
    exampleId: 'Penutupan jalan ini hanyalah sementara.'
  },
  {
    word: 'together',
    indonesianWord: 'bersama',
    phonetic: '/təˈɡeð.ər/',
    partOfSpeech: 'adverb',
    definitionEn: 'With or in proximity to another person or people.',
    definitionId: 'Dengan atau di dekat orang lain; bersama-sama.',
    exampleEn: 'We worked together to complete the project.',
    exampleId: 'Kita bekerja bersama untuk menyelesaikan proyek ini.'
  },
  {
    word: 'tomorrow',
    indonesianWord: 'besok',
    phonetic: '/təˈmɒr.əʊ/',
    partOfSpeech: 'noun',
    definitionEn: 'On the day after today.',
    definitionId: 'Pada hari setelah hari ini.',
    exampleEn: 'We will meet again tomorrow morning.',
    exampleId: 'Kita akan bertemu lagi besok pagi.'
  },

  // U
  {
    word: 'understand',
    indonesianWord: 'memahami',
    phonetic: '/ˌʌn.dəˈstænd/',
    partOfSpeech: 'verb',
    definitionEn: 'Perceive the intended meaning of words, a language, or information.',
    definitionId: 'Merasakan arti yang dimaksud dari kata-kata, bahasa, atau informasi.',
    exampleEn: 'I understand what you mean.',
    exampleId: 'Saya memahami apa yang Anda maksud.'
  },
  {
    word: 'unique',
    indonesianWord: 'unik',
    phonetic: '/juːˈniːk/',
    partOfSpeech: 'adjective',
    definitionEn: 'Being the only one of its kind; unlike anything else.',
    definitionId: 'Menjadi satu-satunya dari jenisnya; tidak seperti yang lain.',
    exampleEn: 'Every person has a unique fingerprint.',
    exampleId: 'Setiap orang memiliki sidik jari yang unik.'
  },
  {
    word: 'universe',
    indonesianWord: 'alam semesta',
    phonetic: '/ˈjuː.nɪ.vɜːs/',
    partOfSpeech: 'noun',
    definitionEn: 'All existing matter and space considered as a whole; the cosmos.',
    definitionId: 'Semua materi dan ruang yang ada yang dianggap sebagai satu kesatuan; kosmos.',
    exampleEn: 'The universe is vast and filled with billions of galaxies.',
    exampleId: 'Alam semesta sangat luas dan dipenuhi miliaran galaksi.'
  },
  {
    word: 'urgent',
    indonesianWord: 'mendesak',
    phonetic: '/ˈɜː.dʒənt/',
    partOfSpeech: 'adjective',
    definitionEn: 'Requiring immediate action or attention.',
    definitionId: 'Memerlukan tindakan atau perhatian segera.',
    exampleEn: 'This email requires an urgent response.',
    exampleId: 'Email ini membutuhkan tanggapan mendesak.'
  },
  {
    word: 'useful',
    indonesianWord: 'berguna',
    phonetic: '/ˈjuːs.fəl/',
    partOfSpeech: 'adjective',
    definitionEn: 'Able to be used for a practical purpose or in several ways.',
    definitionId: 'Dapat digunakan untuk tujuan praktis atau dalam beberapa cara.',
    exampleEn: 'A dictionary is a very useful tool for language learners.',
    exampleId: 'Kamus adalah alat yang sangat berguna bagi pembelajar bahasa.'
  },

  // V
  {
    word: 'vacation',
    indonesianWord: 'liburan',
    phonetic: '/veɪˈkeɪ.ʃən/',
    partOfSpeech: 'noun',
    definitionEn: 'An extended period of recreation, especially one spent away from home.',
    definitionId: 'Periode rekreasi yang panjang, terutama yang dihabiskan jauh dari rumah.',
    exampleEn: 'They went to Bali for their summer vacation.',
    exampleId: 'Mereka pergi ke Bali untuk liburan musim panas mereka.'
  },
  {
    word: 'value',
    indonesianWord: 'nilai',
    phonetic: '/ˈvæl.juː/',
    partOfSpeech: 'noun',
    definitionEn: 'The regard that something is held to deserve; the importance, worth, or usefulness of something.',
    definitionId: 'Penghargaan atas kegunaan atau pentingnya sesuatu; nilai harga atau manfaat.',
    exampleEn: 'This antique painting has a high historical value.',
    exampleId: 'Lukisan antik ini memiliki nilai sejarah yang tinggi.'
  },
  {
    word: 'variety',
    indonesianWord: 'keragaman',
    phonetic: '/səˈlaɪ.ə.ti/',
    partOfSpeech: 'noun',
    definitionEn: 'The quality or state of being different or diverse.',
    definitionId: 'Kualitas atau keadaan menjadi berbeda atau beragam; variasi.',
    exampleEn: 'The shop offers a wide variety of local foods.',
    exampleId: 'Toko ini menawarkan berbagai macam makanan lokal.'
  },
  {
    word: 'victory',
    indonesianWord: 'kemenangan',
    phonetic: '/ˈvɪk.tər.i/',
    partOfSpeech: 'noun',
    definitionEn: 'An act of defeating an enemy or opponent in a battle, game, or other competition.',
    definitionId: 'Tindakan mengalahkan musuh atau lawan dalam pertempuran, permainan, atau kompetisi.',
    exampleEn: 'The team celebrated their hard-earned victory.',
    exampleId: 'Tim merayakan kemenangan yang diperoleh dengan susah payah.'
  },
  {
    word: 'voice',
    indonesianWord: 'suara',
    phonetic: '/vɔɪs/',
    partOfSpeech: 'noun',
    definitionEn: 'The sound produced in a person\'s larynx and uttered through the mouth, as speech or song.',
    definitionId: 'Suara yang dihasilkan oleh pita suara seseorang saat berbicara atau bernyanyi.',
    exampleEn: 'She has a beautiful singing voice.',
    exampleId: 'Dia memiliki suara menyanyi yang indah.'
  },

  // W
  {
    word: 'wait',
    indonesianWord: 'menunggu',
    phonetic: '/weɪt/',
    partOfSpeech: 'verb',
    definitionEn: 'Stay where one is or delay action until a particular time or event.',
    definitionId: 'Tinggal di tempat atau menunda tindakan hingga waktu atau peristiwa tertentu terjadi.',
    exampleEn: 'Please wait for me near the bus station.',
    exampleId: 'Tolong tunggu aku di dekat stasiun bus.'
  },
  {
    word: 'want',
    indonesianWord: 'ingin',
    phonetic: '/wɒnt/',
    partOfSpeech: 'verb',
    definitionEn: 'Have a desire to possess or do something; wish for.',
    definitionId: 'Memiliki keinginan untuk memiliki atau melakukan sesuatu; menghendaki.',
    exampleEn: 'I want to speak English fluently.',
    exampleId: 'Saya ingin berbicara bahasa Inggris dengan lancar.'
  },
  {
    word: 'warm',
    indonesianWord: 'hangat',
    phonetic: '/wɔːm/',
    partOfSpeech: 'adjective',
    definitionEn: 'Of or at a fairly high temperature.',
    definitionId: 'Berada pada suhu yang cukup tinggi namun nyaman; hangat.',
    exampleEn: 'The warm sun felt good after the cold night.',
    exampleId: 'Matahari yang hangat terasa menyenangkan setelah malam yang dingin.'
  },
  {
    word: 'weak',
    indonesianWord: 'lemah',
    phonetic: '/wiːk/',
    partOfSpeech: 'adjective',
    definitionEn: 'Lacking the power to perform physically demanding tasks; lacking strength.',
    definitionId: 'Kekurangan kekuatan untuk melakukan tugas fisik; tidak kuat.',
    exampleEn: 'He felt weak after recovering from the flu.',
    exampleId: 'Dia merasa lemah setelah pulih dari flu.'
  },
  {
    word: 'welcome',
    indonesianWord: 'selamat datang',
    phonetic: '/ˈwel.kəm/',
    partOfSpeech: 'exclamation',
    definitionEn: 'An instance or manner of greeting someone.',
    definitionId: 'Ungkapan salam untuk menyambut kedatangan seseorang.',
    exampleEn: 'Welcome to our beautiful village!',
    exampleId: 'Selamat datang di desa kami yang indah!'
  },

  // X
  {
    word: 'xenon',
    indonesianWord: 'xenon',
    phonetic: '/ˈzen.ɒn/',
    partOfSpeech: 'noun',
    definitionEn: 'A chemical element of the noble gas group.',
    definitionId: 'Unsur kimia dari kelompok gas mulia.',
    exampleEn: 'Xenon is used in some specialized flash lamps.',
    exampleId: 'Xenon digunakan pada beberapa lampu kilat khusus.'
  },
  {
    word: 'xerox',
    indonesianWord: 'fotokopi',
    phonetic: '/ˈzɪə.rɒks/',
    partOfSpeech: 'verb',
    definitionEn: 'Make a xerographic copy of a document.',
    definitionId: 'Membuat salinan dokumen menggunakan mesin xerografi.',
    exampleEn: 'Can you please xerox these sheets for the students?',
    exampleId: 'Bisakah Anda memfotokopi lembaran ini untuk para siswa?'
  },

  // Y
  {
    word: 'year',
    indonesianWord: 'tahun',
    phonetic: '/jɪər/',
    partOfSpeech: 'noun',
    definitionEn: 'The time taken by a planet to make one revolution around the sun.',
    definitionId: 'Waktu yang dibutuhkan sebuah planet untuk melakukan satu putaran mengelilingi matahari (365/366 hari).',
    exampleEn: 'We moved to Jakarta two years ago.',
    exampleId: 'Kami pindah ke Jakarta dua tahun yang lalu.'
  },
  {
    word: 'yellow',
    indonesianWord: 'kuning',
    phonetic: '/ˈjel.əʊ/',
    partOfSpeech: 'adjective',
    definitionEn: 'Of the color between green and orange in the spectrum.',
    definitionId: 'Berwarna seperti warna lemon matang atau emas.',
    exampleEn: 'The sunflowers are bright yellow.',
    exampleId: 'Bunga matahari berwarna kuning cerah.'
  },
  {
    word: 'young',
    indonesianWord: 'muda',
    phonetic: '/jʌŋ/',
    partOfSpeech: 'adjective',
    definitionEn: 'Having lived or existed for only a short time.',
    definitionId: 'Baru hidup atau ada untuk waktu yang singkat; belum tua.',
    exampleEn: 'The young plants need daily watering.',
    exampleId: 'Tanaman muda itu butuh disiram setiap hari.'
  },

  // Z
  {
    word: 'zebra',
    indonesianWord: 'zebra',
    phonetic: '/ˈzeb.rə/',
    partOfSpeech: 'noun',
    definitionEn: 'An African wild horse with black-and-white stripes.',
    definitionId: 'Kuda liar Afrika yang memiliki garis-garis hitam dan putih.',
    exampleEn: 'We saw a zebra eating grass in the safari park.',
    exampleId: 'Kita melihat zebra sedang memakan rumput di taman safari.'
  },
  {
    word: 'zenith',
    indonesianWord: 'puncak',
    phonetic: '/ˈzen.ɪθ/',
    partOfSpeech: 'noun',
    definitionEn: 'The time at which something is most powerful or successful.',
    definitionId: 'Titik puncak; waktu di mana sesuatu berada pada masa kejayaan atau kesuksesan tertinggi.',
    exampleEn: 'The empire reached its zenith in the twelfth century.',
    exampleId: 'Kekaisaran itu mencapai puncaknya pada abad kedua belas.'
  },
  {
    word: 'zero',
    indonesianWord: 'nol',
    phonetic: '/ˈzɪə.rəʊ/',
    partOfSpeech: 'noun',
    definitionEn: 'The numerical value of nothing.',
    definitionId: 'Nilai angka kosong atau tidak ada nilai sama sekali.',
    exampleEn: 'Water freezes at zero degrees Celsius.',
    exampleId: 'Air membeku pada suhu nol derajat Celsius.'
  }
];
