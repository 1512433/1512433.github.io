document.addEventListener('DOMContentLoaded', function(){
  var vid = document.getElementById('cartoon');
  var cvs = document.getElementById('canvas1');
  var ctx = cvs.getContext('2d');
  var back = document.createElement('canvas');
  var backcontext = back.getContext('2d');

  var cvs_w, cvs_h;

  vid.addEventListener('play', function(){
      cvs_w =vid.clientWidth;
      cvs_h = vid.clientHeight;
      cvs.width = cvs_w;
      cvs.height = cvs_h;
      back.width = cvs_w;
      back.height = cvs_h;

      draw(vid, ctx, backcontext, cvs_w, cvs_h);
  },false);
}, false);

function draw(v, c, bc, cw, ch) {
  if(v.paused || v.ended) return false;
  // First, draw it into the backing canvas
  bc.drawImage(v,0,0, cw,ch);

  // Grab the pixel data from the backing canvas
  var idata = bc.getImageData(0,0,cw,ch);
  var data_x = bc.getImageData(0,0,cw,ch);
  var data_y = bc.getImageData(0,0,cw,ch);

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

  convolution(data_x.data,idata.data,cw,kernel_x);  //Đạo hàm theo truc x
  convolution(data_y.data,idata.data,cw,kernel_y);  //Đạo hàm theo trục y
  
    for(var i = 0; i < data_x.data.length; i++) {
        // if(i%4==3) continue;   
        if(i%4==3) data_x.data[i] = 255;
        else 
            var g_x = data_x.data[i]*data_x.data[i];
            var g_y = data_y.data[i]*data_y.data[i];
            var g = Math.sqrt(g_x + g_y);
            if(g>255) g = 255;

            data_x.data[i] = g;

        // data_x.data[i+1] = data_y.data[i+1];
        // data_x.data[i+2] = (data_x.data[i]+data_x.data[i+1])/4;
        // data_x.data[i+3] = 255;
    }
  // idata.data = data;
  // Draw the pixels onto the visible canvas
  c.putImageData(data_x,0,0);
  // Start over!
  setTimeout(draw,20,v,c,bc,cw,ch);
}

// Tính tích chập theo kernel đưa vào
// - data lưu dữ liệu đã biến đổi
// - idata là dữ liệu nguồn
// - w là chiều rộng ảnh đề tính widthstep
// - widthstep dùng để điều chỉnh lên dòng hay xuống dòng
// - kernel_step dùng để điều chỉnh lùi cột hay tiến cột 
// - i_local là biến chỉ vị trí xung quanh i 
function convolution(data, idata, w, kernel, opaque=true, threshold=20){

  var kernel_size = Math.sqrt(kernel.length); 

  for(var i = 0; i < data.length; i+=4) {
    //   if(i%4==3) continue;
      var alphaFac = opaque ? 1 : 0;

      var g = 0;
      var g1 = 0;
      var g2 = 0;
      var g3 = 0;
      for(var k = 0; k < kernel.length; k+=1) {    

        var kernel_step = ((k%kernel_size)-1)*4;
        var widthstep = w*(Math.trunc(k/kernel_size)-1)*4;
        var i_local = i + widthstep + kernel_step;

        if(kernel_step==0 && widthstep==0) continue;

        if(( i_local >= 0) && (i_local < data.length)){
            var x = idata[i_local];
            var y = kernel[k];
            g += x*y;
        }   
        var i1_local = i+1 + widthstep + kernel_step;
        if(( i1_local >= 0) && (i1_local < data.length)){
            var x = idata[i1_local];
            var y = kernel[k];
            g1 += x*y;
        }   
        var i2_local = i+2 + widthstep + kernel_step;
        if(( i2_local >= 0) && (i2_local < data.length)){
            var x = idata[i2_local];
            var y = kernel[k];
            g2 += x*y;
        }   
        var i3_local = i+3 + widthstep + kernel_step;
        if(( i3_local >= 0) && (i3_local < data.length)){
            var x = idata[i1_local];
            var y = kernel[k];
            g3 += x*y;
        }   
      } 
      
        g3 += alphaFac * (255 - g3);
        g = Math.abs(g);
        g1 = Math.abs(g1);
        g2 = Math.abs(g2);
        g3 = Math.abs(g3);

    if(g > 255 ) {
        g = 255;
    }
    if(g1 > 255 ) {
        g1 = 255;
    }
    if(g2 > 255 ) {
        g2 = 255;
    }
    if(g3 > 255 ) {
        g3 = 255;
    }

    if(g < threshold ) {
        g = 0;
    }
    if(g1 < threshold ) {
        g1 = 0;
    }
    if(g2 < threshold ) {
        g2 = 0;
    }
   
      data[i] = g;
      data[i+1] = g1;
      data[i+2] = g2;
      data[i+3] = g3;
      
  }
}
