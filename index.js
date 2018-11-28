document.addEventListener('DOMContentLoaded', function(){
  var vid = document.getElementById('cartoon');
  var cvs = document.getElementById('canvas1');
  var ctx = cvs.getContext('2d');
//   var back = document.createElement('canvas');
//   var backcontext = back.getContext('2d');

  var cvs_w , cvs_h;

  vid.addEventListener('play', function(){
      cvs_w = vid.clientWidth;
      cvs_h = vid.clientHeight;
    //   cvs.width = cvs_w;
    //   cvs.height = cvs_h;
    //   back.width = cvs_w;
    //   back.height = cvs_h;
      
      
      draw(vid, ctx, cvs_w, cvs_h);
  },false);
}, false);

function draw(v, c, cw, ch) {
  if(v.paused || v.ended) return false;
  // First, draw it into the canvas
  c.drawImage(v,650,0, cw, ch);

  // Grab the pixel data from the canvas
  var idata = c.getImageData(650,0,cw,ch);
 
  // Loop through the pixels, turning them grayscale
  for(var i = 0; i < idata.data.length; i+=4) {
      var r = idata.data[i];
      var g = idata.data[i+1];
      var b = idata.data[i+2];
      var brightness = (3*r+4*g+b)>>>3;
      idata.data[i] = brightness;
      idata.data[i+1] = brightness;
      idata.data[i+2] = brightness;
  }
  var kernel_x = [+1, 0, -1, +2, 0, -2, +1, 0, -1];
  var kernel_y = [+1, +2, +1, 0, 0, 0, -1, -2, -1];
  var data = [];
  convolution(data,idata.data,cw,kernel_x, kernel_y);  //Đạo hàm theo truc x

  for (var i = 0; i < idata.data.length; i++) {
            idata.data[i] = data[i];
}
//   idata.data = data;
  // Draw the pixels onto the visible canvas
  c.putImageData(idata,650,0);
  // Start over!
  setTimeout(draw,0,v,c,cw,ch);
}

// Tính tích chập theo kernel đưa vào
// - data lưu dữ liệu đã biến đổi
// - idata là dữ liệu nguồn
// - w là chiều rộng ảnh đề tính widthstep
// - widthstep dùng để điều chỉnh lên dòng hay xuống dòng
// - kernel_step dùng để điều chỉnh lùi cột hay tiến cột 
// - i_local là biến chỉ vị trí xung quanh i 
function convolution(data, idata, w, kernel_x,kernel_y, opaque=true, threshold=0){

  var kernel_size = Math.sqrt(kernel_x.length); 
  var kernel_step = [-1, -1, -1,0,0,0,1,1,1];
  for(var i = 0; i < idata.length; i++) {
    //   if(i%4==3) continue;
      var alphaFac = opaque ? 1 : 0;

      var g_x = 0;
      var g_y = 0;

      for(var k = 0; k < kernel_x.length; k+=1) {    
        var widthstep = w*kernel_step[k]*4;
        var i_local = i + widthstep + kernel_step[k]*4;

        // if(kernel_step[k]==0 && widthstep==0) continue;

        if(( i_local >= 0) && (i_local < idata.length)){
            var x = idata[i_local];
            var y_x = kernel_x[k];
            var y_y = kernel_y[k];
            g_x += x*y_x;
            g_y += x*y_y;
        }   
      } 
    g_x = Math.abs(g_x);
    g_y = Math.abs(g_y);
    if(i%4==3) {
        g_x += alphaFac * (255 - g_x);
        g_y += alphaFac * (255 - g_y);
    }
        
    var g = Math.sqrt(g_x*g_x + g_y*g_y);
    if(g > 255) {
        g = 255;
    }

    if(g < threshold) {
        g = 0;
    }
    data[i] = g;
      
  }
}