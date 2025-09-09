import '../../src/configs/env';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export const productSeeder = async () => {
  const products = [
    {
      id: 'NPK_15_15_15_Premium',
      name: 'Pupuk NPK Mutiara 15-15-15',
      description:
        'Pupuk majemuk seimbang untuk pertumbuhan vegetatif dan generatif. Cocok untuk semua jenis tanaman.',
      productTypeId: 'Pupuk_NPK',
      storageInstructions:
        'Simpan di tempat kering, sejuk, dan terhindar dari sinar matahari langsung.',
      expiredDurationInYears: 3,
      usageInstructions:
        'Taburkan 2-3 sendok makan per tanaman atau 300-500 kg/ha. Ulangi setiap 3 bulan.',
      benefits:
        'Mempercepat pertumbuhan daun, memperkuat batang, dan merangsang pembungaan serta pembuahan.',
      composition: 'N 15%, P 15%, K 15%',
      imageUrl: 'https://example.com/images/NPK_15_15_15_Premium.jpg',
    },
    {
      id: 'NPK_Phonska_Plus',
      name: 'Pupuk NPK Phonska Plus',
      description:
        'Diperkaya dengan Zink (Zn) untuk mengoptimalkan pertumbuhan tanaman dan mencegah defisiensi.',
      productTypeId: 'Pupuk_NPK',
      storageInstructions:
        'Jauhkan dari sumber api dan bahan mudah terbakar. Simpan dalam wadah tertutup.',
      expiredDurationInYears: 2,
      usageInstructions:
        'Dosis anjuran 300 kg/ha untuk tanaman pangan seperti padi dan jagung.',
      benefits:
        'Meningkatkan efisiensi penyerapan unsur hara, membuat tanaman lebih hijau dan tahan penyakit.',
      composition: 'NPK + Zn',
      imageUrl: 'https://example.com/images/NPK_Phonska_Plus.jpg',
    },
    {
      id: 'NPK_Grower_Special',
      name: 'Pupuk NPK Grower Special',
      description:
        'Formula khusus untuk fase pertumbuhan vegetatif, dengan kandungan Nitrogen lebih tinggi.',
      productTypeId: 'Pupuk_NPK',
      storageInstructions: 'Simpan di gudang berventilasi baik.',
      expiredDurationInYears: 3,
      usageInstructions:
        'Ideal untuk pemupukan kedua pada tanaman sayuran daun dan perkebunan muda.',
      benefits: 'Merangsang pertumbuhan tunas dan daun baru secara masif.',
      composition: 'N tinggi, P, K',
      imageUrl: 'https://example.com/images/NPK_Grower_Special.jpg',
    },
    {
      id: 'NPK_Booster_Buah',
      name: 'Pupuk NPK Booster Buah',
      description:
        'Kandungan Kalium (K) tinggi untuk meningkatkan kualitas, rasa, dan bobot buah.',
      productTypeId: 'Pupuk_NPK',
      storageInstructions: 'Hindari penyimpanan di tempat lembab.',
      expiredDurationInYears: 2,
      usageInstructions:
        'Aplikasikan saat tanaman memasuki fase generatif atau pembentukan buah.',
      benefits: 'Membuat buah lebih manis, besar, dan tidak mudah rontok.',
      composition: 'NPK dengan K tinggi',
      imageUrl: 'https://example.com/images/NPK_Booster_Buah.jpg',
    },
    {
      id: 'NPK_Compact_SlowRelease',
      name: 'Pupuk NPK Compact Slow Release',
      description:
        'Pupuk granul padat yang melepaskan hara secara perlahan dan terkendali.',
      productTypeId: 'Pupuk_Granul',
      storageInstructions: 'Simpan dalam kemasan asli yang tertutup rapat.',
      expiredDurationInYears: 4,
      usageInstructions:
        'Cukup aplikasikan sekali setiap 6 bulan untuk tanaman hias atau tabulampot.',
      benefits:
        'Nutrisi tersedia berkelanjutan, mengurangi frekuensi pemupukan dan pencemaran lingkungan.',
      composition: 'NPK slow release',
      imageUrl: 'https://example.com/images/NPK_Compact_SlowRelease.jpg',
    },
    // Organic Products (4)
    {
      id: 'Organik_Granul_Super',
      name: 'Pupuk Organik Granul Super',
      description:
        'Pupuk organik padat dari bahan alami pilihan untuk memperbaiki struktur tanah.',
      productTypeId: 'Pupuk_Organik',
      storageInstructions: 'Simpan di tempat yang tidak terkena hujan.',
      expiredDurationInYears: 2,
      usageInstructions: 'Gunakan sebagai pupuk dasar dengan dosis 1-2 ton/ha.',
      benefits:
        'Meningkatkan kesuburan tanah, kapasitas tukar kation, dan aktivitas mikroorganisme tanah.',
      composition: 'Bahan organik alami',
      imageUrl: 'https://example.com/images/Organik_Granul_Super.jpg',
    },
    {
      id: 'Kompos_Super_Matang',
      name: 'Pupuk Kompos Super Matang',
      description:
        'Kompos dari limbah organik yang telah terdekomposisi sempurna, bebas gulma dan penyakit.',
      productTypeId: 'Pupuk_Kandang',
      storageInstructions:
        'Jaga kelembaban kompos, jangan terlalu kering atau basah.',
      expiredDurationInYears: 1,
      usageInstructions:
        'Campurkan dengan media tanam dengan perbandingan 1:3 atau sebagai mulsa.',
      benefits:
        'Menyediakan hara makro dan mikro esensial secara alami dan memperbaiki drainase tanah.',
      composition: 'Kompos organik',
      imageUrl: 'https://example.com/images/Kompos_Super_Matang.jpg',
    },
    {
      id: 'Organik_Cair_Plus_Giberelin',
      name: 'Pupuk Organik Cair Plus Giberelin',
      description:
        'POC yang diperkaya dengan hormon Giberelin untuk merangsang pertumbuhan tunas dan bunga.',
      productTypeId: 'Pupuk_Cair',
      storageInstructions: 'Kocok sebelum digunakan. Simpan di tempat sejuk.',
      expiredDurationInYears: 1,
      usageInstructions:
        'Semprotkan ke seluruh bagian tanaman pada pagi hari, dosis 2-4 ml/liter air.',
      benefits:
        'Mempercepat perkecambahan, pembungaan, dan mengurangi kerontokan bunga.',
      composition: 'Ekstrak organik + Giberelin',
      imageUrl: 'https://example.com/images/Organik_Cair_Plus_Giberelin.jpg',
    },
    {
      id: 'Guano_Fosfat_Alami',
      name: 'Pupuk Guano Fosfat Alami',
      description:
        'Pupuk organik dari kotoran kelelawar, kaya akan Fosfor alami untuk perakaran dan pembungaan.',
      productTypeId: 'Pupuk_Organik',
      storageInstructions: 'Simpan dalam karung tertutup di tempat kering.',
      expiredDurationInYears: 5,
      usageInstructions:
        'Taburkan di sekitar perakaran saat awal tanam atau menjelang fase pembungaan.',
      benefits:
        'Merangsang pertumbuhan akar yang kuat dan memaksimalkan potensi pembungaan.',
      composition: 'Guano (Fosfor tinggi)',
      imageUrl: 'https://example.com/images/Guano_Fosfat_Alami.jpg',
    },
    // Hayati Products (3)
    {
      id: 'Bio_Trichoderma_Hayati',
      name: 'Pupuk Hayati Bio Trichoderma',
      description:
        'Mengandung jamur antagonis Trichoderma sp. untuk melindungi tanaman dari penyakit tular tanah.',
      productTypeId: 'Pupuk_Hayati',
      storageInstructions:
        'Simpan di kulkas atau tempat sejuk, hindari sinar matahari langsung.',
      expiredDurationInYears: 1,
      usageInstructions:
        'Campurkan dengan pupuk kandang atau taburkan di lubang tanam.',
      benefits:
        'Mencegah penyakit busuk akar, layu fusarium, dan rebah semai secara biologis.',
      composition: 'Trichoderma sp.',
      imageUrl: 'https://example.com/images/Bio_Trichoderma_Hayati.jpg',
    },
    {
      id: 'Mikroba_Rhizobium_Plus',
      name: 'Pupuk Hayati Mikroba Rhizobium Plus',
      description:
        'Inokulan bakteri Rhizobium untuk tanaman kacang-kacangan guna meningkatkan penambatan Nitrogen.',
      productTypeId: 'Pupuk_Hayati',
      storageInstructions: 'Simpan di tempat sejuk dan gelap.',
      expiredDurationInYears: 1,
      usageInstructions: 'Campurkan pada benih sebelum tanam (seed treatment).',
      benefits:
        'Mengurangi kebutuhan pupuk N kimia, meningkatkan bintil akar, dan menyuburkan tanah.',
      composition: 'Rhizobium sp.',
      imageUrl: 'https://example.com/images/Mikroba_Rhizobium_Plus.jpg',
    },
    {
      id: 'Myco_Plus_Mikoriza',
      name: 'Pupuk Hayati Myco Plus Mikoriza',
      description:
        'Berisi spora jamur Mikoriza yang bersimbiosis dengan akar untuk memperluas jangkauan penyerapan hara.',
      productTypeId: 'Pupuk_Hayati',
      storageInstructions:
        'Simpan pada suhu ruang, jauhkan dari pestisida kimia.',
      expiredDurationInYears: 2,
      usageInstructions:
        'Taburkan di area perakaran saat tanam atau pindah tanam.',
      benefits:
        'Meningkatkan penyerapan Fosfor dan air, serta meningkatkan ketahanan tanaman terhadap kekeringan.',
      composition: 'Spora Mikoriza',
      imageUrl: 'https://example.com/images/Myco_Plus_Mikoriza.jpg',
    },
    // Chemical Single Products (4)
    {
      id: 'Urea_NonSubsidi',
      name: 'Pupuk Urea Non-Subsidi',
      description:
        'Sumber Nitrogen (N) 46% untuk pertumbuhan vegetatif yang cepat.',
      productTypeId: 'Pupuk_Kimia',
      storageInstructions: 'Simpan di tempat kering dan tertutup.',
      expiredDurationInYears: 2,
      usageInstructions:
        'Gunakan sesuai dosis anjuran, jangan berlebihan untuk menghindari penguapan.',
      benefits:
        'Membuat daun lebih hijau, rimbun, dan mempercepat pertumbuhan tanaman.',
      composition: 'Urea (N 46%)',
      imageUrl: 'https://example.com/images/Urea_NonSubsidi.jpg',
    },
    {
      id: 'ZA_Amonium_Sulfat',
      name: 'Pupuk ZA (Amonium Sulfat)',
      description:
        'Sumber Nitrogen dan Belerang (Sulfur) untuk tanaman yang membutuhkan kedua unsur tersebut.',
      productTypeId: 'Pupuk_Kimia',
      storageInstructions:
        'Hindari kontak langsung dengan kulit, gunakan sarung tangan.',
      expiredDurationInYears: 2,
      usageInstructions: 'Cocok untuk tanaman bawang, kubis, dan tebu.',
      benefits:
        'Meningkatkan anakan, kualitas umbi, dan aroma pada tanaman hortikultura.',
      composition: 'Amonium Sulfat (N, S)',
      imageUrl: 'https://example.com/images/ZA_Amonium_Sulfat.jpg',
    },
    {
      id: 'KCL_Kalium_Klorida',
      name: 'Pupuk KCL (Kalium Klorida)',
      description:
        'Sumber Kalium (K2O) 60% untuk kekuatan batang dan kualitas buah.',
      productTypeId: 'Pupuk_Kimia',
      storageInstructions: 'Simpan terpisah dari pupuk Nitrogen.',
      expiredDurationInYears: 3,
      usageInstructions: 'Aplikasikan pada fase generatif untuk hasil optimal.',
      benefits:
        'Memperkuat batang agar tidak mudah rebah, meningkatkan bobot dan rasa buah.',
      composition: 'Kalium Klorida (K2O 60%)',
      imageUrl: 'https://example.com/images/KCL_Kalium_Klorida.jpg',
    },
    {
      id: 'SP36_Super_Fosfat',
      name: 'Pupuk SP-36 Super Fosfat',
      description:
        'Sumber Fosfor (P2O5) 36% yang sangat penting untuk perkembangan akar dan pembungaan.',
      productTypeId: 'Pupuk_Kimia',
      storageInstructions: 'Simpan di tempat kering dan tidak lembab.',
      expiredDurationInYears: 4,
      usageInstructions: 'Diberikan sebagai pupuk dasar sebelum tanam.',
      benefits:
        'Memacu pertumbuhan sistem perakaran yang sehat dan merangsang pembentukan bunga.',
      composition: 'Super Fosfat (P2O5 36%)',
      imageUrl: 'https://example.com/images/SP36_Super_Fosfat.jpg',
    },
    // Micro Nutrient Products (4)
    {
      id: 'Mikro_Boron_Plus',
      name: 'Pupuk Mikro Boron Plus',
      description:
        'Mengandung Boron (B) untuk mencegah kerontokan bunga dan buah.',
      productTypeId: 'Pupuk_Mikro',
      storageInstructions: 'Simpan dalam wadah tertutup.',
      expiredDurationInYears: 2,
      usageInstructions:
        'Semprotkan pada daun dengan konsentrasi rendah saat tanaman mulai berbunga.',
      benefits:
        'Meningkatkan pembentukan serbuk sari, mencegah buah pecah dan cacat.',
      composition: 'Boron (B)',
      imageUrl: 'https://example.com/images/Mikro_Boron_Plus.jpg',
    },
    {
      id: 'Mikro_Fe_Chelate',
      name: 'Pupuk Mikro Fe-Chelate (Besi)',
      description:
        'Unsur Besi (Fe) dalam bentuk chelate yang mudah diserap untuk mengatasi klorosis (daun menguning).',
      productTypeId: 'Pupuk_Mikro',
      storageInstructions: 'Jauhkan dari sinar matahari langsung.',
      expiredDurationInYears: 3,
      usageInstructions: 'Dapat disemprotkan ke daun atau dikocorkan ke tanah.',
      benefits:
        'Menghijaukan kembali daun yang kuning karena kekurangan zat besi.',
      composition: 'Fe-Chelate',
      imageUrl: 'https://example.com/images/Mikro_Fe_Chelate.jpg',
    },
    {
      id: 'Kalsium_Nitrat_Super',
      name: 'Pupuk Kalsium Nitrat Super',
      description:
        'Sumber Kalsium (Ca) dan Nitrogen Nitrat untuk mencegah busuk ujung buah (blossom end rot).',
      productTypeId: 'Pupuk_Mikro',
      storageInstructions: 'Simpan di tempat yang tidak lembab.',
      expiredDurationInYears: 2,
      usageInstructions:
        'Sangat dianjurkan untuk tanaman tomat, cabai, dan melon.',
      benefits:
        'Memperkuat dinding sel tanaman, membuat buah lebih padat dan tahan simpan.',
      composition: 'Kalsium Nitrat (Ca, N)',
      imageUrl: 'https://example.com/images/Kalsium_Nitrat_Super.jpg',
    },
    {
      id: 'Magnesium_Sulfat_Epsom',
      name: 'Pupuk Magnesium Sulfat (Garam Epsom)',
      description:
        'Sumber Magnesium (Mg) dan Sulfur (S) untuk pembentukan klorofil dan fotosintesis.',
      productTypeId: 'Pupuk_Mikro',
      storageInstructions: 'Simpan dalam kemasan tertutup.',
      expiredDurationInYears: 3,
      usageInstructions:
        'Larutkan dalam air dan semprotkan ke daun atau kocorkan ke tanah.',
      benefits:
        'Mencegah daun tua menguning dan meningkatkan vitalitas tanaman secara keseluruhan.',
      composition: 'Magnesium Sulfat (Mg, S)',
      imageUrl: 'https://example.com/images/Magnesium_Sulfat_Epsom.jpg',
    },
  ];

  for (const product of products) {
    try {
      await prisma.product.create({
        data: product,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        continue;
      }
      throw error;
    }
  }
  console.log('Products seeded successfully!');
};
