const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const xml2js = require('xml2js');

// Windows Olay Loglarını Okuma
async function fetchEventLogs() {
  try {
    // Kullanıcı adı, parola ve sunucu bilgileri
    const username = 'dikkan\\pa.ali';
    const password = 'ProtoS123!@';
    const server = 'NB0123';
    const EventID = '4799';//4660: Dosya/Klasör Silme, 4663: Dosya/Klasör Erişim/Oluşturma

    // wevtutil ile Security loglarından 4660 ve 4663 ID'li olayları çekme (XML formatında)
    // const command = `wevtutil qe Security /q:"*[System[(EventID=${EventID})]]" /r:${server} /u:${username} /p:${password} /f:xml`;
    const command = `wevtutil qe Security /q:"*[System[(EventID=${EventID})]]" /r:${server} /u:${username} /p:${password} /f:xml`;
    const { stdout } = await execPromise(command);

    // XML'i JSON'a çevirme
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(stdout);

    // Check if result or result.Events is null/undefined
    if (!result || !result.Events || !result.Events.Event) {
      console.log('No events found for Event ID 4660');
      return;
    }

    const events = Array.isArray(result.Events.Event) ? result.Events.Event : [result.Events.Event];

    for (const event of events) {
      const eventId = parseInt(event.System.EventID);
      const timeCreated = new Date(event.System.TimeCreated['$'].SystemTime);
      const user = event.EventData.Data.find(d => d['$'].Name === 'SubjectUserName')?.['_'] || 'Bilinmiyor';
      const objectName = event.EventData.Data.find(d => d['$'].Name === 'ObjectName')?.['_'] || 'Bilinmiyor';
      const accessType = event.EventData.Data.find(d => d['$'].Name === 'AccessMask')?.['_'] || 'Bilinmiyor';

      // Event tipini belirleme
      let eventType = '';
      if (eventId === 4660) {
        eventType = 'Dosya/Klasör Silme';
      } else if (eventId === 4663) {
        const access = parseInt(accessType, 16);
        if (access & 0x2) eventType = 'Dosya/Klasör Yazma/Değiştirme';
        else if (access & 0x10000) eventType = 'Dosya/Klasör Silme (Detay)';
        else eventType = 'Dosya/Klasör Erişim/Oluşturma';
      }

      // Konsola yazdırma
      console.log({
        eventId,
        eventType,
        objectName,
        accessType,
        timestamp: timeCreated,
        user,
        details: event.EventData
      });
    }
  } catch (error) {
    console.error('Olay logları alınırken hata:', error);
  }
}

// Ana Fonksiyon
async function main() {
  // Periyodik olarak logları kontrol et (örneğin her 5 dakikada bir)
  setInterval(fetchEventLogs, 5 * 60 * 1000);

  // İlk çalıştırmada hemen logları çek
  await fetchEventLogs();
}

// Uygulamayı başlat
main().catch(console.error);