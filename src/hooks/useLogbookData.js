import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useLogbookData(user) {
  const [entries, setEntries] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [userAircraft, setUserAircraft] = useState([]);
  const [engines, setEngines] = useState([]);
  const [aircraftEngines, setAircraftEngines] = useState([]); // aircraft-engine relationships
  const [ataChapters, setAtaChapters] = useState([]);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: entriesData, error: entriesError } = await supabase
        .from('logbook_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (entriesError) throw entriesError;
      setEntries(entriesData || []);

      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('supervisors')
        .select('*')
        .order('created_at', { ascending: false });

      if (supervisorsError) throw supervisorsError;
      setSupervisors(supervisorsData || []);

      const { data: aircraftData, error: aircraftError } = await supabase
        .from('aircraft_types')
        .select('*')
        .order('type_code');

      if (aircraftError) throw aircraftError;
      setAircraftTypes(aircraftData || []);

      const { data: userAircraftData, error: userAircraftError } = await supabase
        .from('user_aircraft')
        .select('*')
        .order('registration');

      if (userAircraftError) throw userAircraftError;
      setUserAircraft(userAircraftData || []);

      const { data: enginesData, error: enginesError } = await supabase
        .from('engines')
        .select('*')
        .order('manufacturer, model, variant');

      if (enginesError) throw enginesError;
      setEngines(enginesData || []);

      const { data: aircraftEnginesData, error: aircraftEnginesError } = await supabase
        .from('aircraft_type_engines')
        .select('*');

      if (aircraftEnginesError) throw aircraftEnginesError;
      setAircraftEngines(aircraftEnginesData || []);

      const { data: ataData, error: ataError } = await supabase
        .from('ata_chapters')
        .select('*')
        .order('chapter_code');

      if (ataError) throw ataError;
      setAtaChapters(ataData || []);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      const { data: addressesData, error: addressesError } = await supabase
        .from('address_history')
        .select('*')
        .order('from_date', { ascending: false });

      if (addressesError) throw addressesError;
      setAddresses(addressesData || []);

      const { data: employmentData, error: employmentError } = await supabase
        .from('employment_history')
        .select('*')
        .order('from_date', { ascending: false });

      if (employmentError) throw employmentError;
      setEmploymentHistory(employmentData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return {
    entries,
    supervisors,
    aircraftTypes,
    userAircraft,
    engines,
    aircraftEngines,
    ataChapters,
    profile,
    addresses,
    employmentHistory,
    loading,
    reloadData: loadData
  };
}
