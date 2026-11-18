// ===== TẤT CẢ DỮ LIỆU CÁ NHÂN NẰM Ở ĐÂY =====
export const CFG = {
  name: 'Hồng Anh',
  nick: 'Bống',

  password: {
    birthday: '27/11/2007',          // DD/MM/YYYY — đổi ngày sinh ở đây (chỉ ở đây)
    maxTries: 5,                     // sai quá số lần này sẽ bị khóa tạm
    cooldownMs: 1500,                // thời gian chờ giữa 2 lần thử
    lockoutMs: 30000,                // thời gian khóa sau khi sai quá nhiều
    wrongMsg: 'Yasss. Sai rồi, Haii nhập lại đi !'
  },

  timing: {
    giftAutoNextSec: 6,              // tự sang album sau khi mở quà
    letterMaxSec: 30                 // thư viết xong tối đa trong bấy nhiêu giây
  },

  music: {                           // thử lần lượt từng file, bỏ file vào assets/music/
    tracks: ['assets/music/birthday.mp3'],
    volume: 0.5
  },

  gallery: {                         // 8 ảnh (JPG/PNG/WebP). Thiếu ảnh -> hiện placeholder
    items: [
      { src: 'assets/images/01.jpg', caption: '2 ' },
      { src: 'assets/images/02.jpg', caption: '7' },
      { src: 'assets/images/03.jpg', caption: '1' },
      { src: 'assets/images/04.jpg', caption: '1' },
      { src: 'assets/images/05.jpg', caption: '2' },
      { src: 'assets/images/06.jpg', caption: '0' },
      { src: 'assets/images/07.jpg', caption: '0' },
      { src: 'assets/images/08.jpg', caption: '7' },
      { src: 'assets/images/09.jpg', caption: 'MÙA ĐÔNG' },
      { src: 'assets/images/10.jpg', caption: 'ƠI' },
      { src: 'assets/images/11.jpg', caption: 'MÙA ĐÔNG' },
      { src: 'assets/images/12.jpg', caption: 'HỠI' },
      { src: 'assets/images/13.jpg', caption: 'GIẢM CÂN NHA NHÓC' }
    ]
  },

  letter: `Gửi Chị Bống,

Happy Birthday!

Chúc chị Bống bước sang tuổi mới luôn thật vui vẻ, hạnh phúc và bình an.

Mong rằng những điều tốt đẹp nhất sẽ luôn tìm đến chị . Dù phía trước có những ngày vui hay những ngày không như ý, hy vọng chị vẫn luôn giữ được lụ cười:) và sự tự tin của mình.

Mong những ước mơ mà chị đang ấp ủ sẽ từng bước trở thành hiện thực.

Chúc Chị sinh VUI VẺ nhé, hé hé!

With love,
Cre: Em Tí.`
};
