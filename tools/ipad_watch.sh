#!/bin/bash
# צופה-רקע: ברגע שהאייפד מופיע — מצמד, מצלם מסך, וכותב ליומן. רץ עד 10 דקות.
OUT=/Users/sarussi-mac/masa-alef/docs/device; LOG=$OUT/watch.log; mkdir -p $OUT; : > $LOG
for i in $(seq 1 600); do
  U=$(idevice_id -l 2>/dev/null | head -1)
  if [ -n "$U" ]; then
    R=$(idevicepair -u $U pair 2>&1); echo "$(date +%T) $R" >> $LOG
    if echo "$R" | grep -q SUCCESS; then
      echo "$(date +%T) PAIRED $U" >> $LOG
      ideviceinfo -u $U -k DeviceName >> $LOG 2>&1; ideviceinfo -u $U -k ProductVersion >> $LOG 2>&1
      for k in 1 2 3; do idevicescreenshot -u $U $OUT/ipad-$k.png >> $LOG 2>&1; sleep 2; done
      echo "$(date +%T) DONE" >> $LOG; exit 0
    fi
  fi
  sleep 1
done
echo "$(date +%T) TIMEOUT" >> $LOG
